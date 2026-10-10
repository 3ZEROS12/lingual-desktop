import { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen, clipboard } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDesktopConfig, saveDesktopConfig, type LingualDesktopConfig, type CompanionMode } from "./config.js";
import {
  getActiveWindowHwnd,
  restoreFocus,
  getCaretPosition,
  getFocusedElementRect,
  captureActiveInputText,
  injectTextToTarget,
  triggerPaste,
  isImeComposing,
} from "./win32.js";
import { executeTranslation, shouldTriggerTranslation } from "./engine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let companionWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

let currentMode: CompanionMode = "english";
let activeTargetHwnd = "0";
let activeBackupText = "";
let currentTranslationResponse: any = null;
let viewState: "capsule" | "hud" | "spotlight" = "capsule";
let caretPollInterval: NodeJS.Timeout | null = null;

const CAPSULE_WIDTH = 84;
const CAPSULE_HEIGHT = 30;
const HUD_WIDTH = 540;
const HUD_HEIGHT = 280;

function createCompanionWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: CAPSULE_WIDTH,
    height: CAPSULE_HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    resizable: false,
    focusable: false, // Never steal typing focus in capsule state!
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererHtml = path.join(__dirname, "../../src/renderer/index.html");
  win.loadFile(rendererHtml);

  // When in HUD state and losing focus, auto-dismiss back to capsule
  win.on("blur", () => {
    if (viewState === "hud" || viewState === "spotlight") {
      switchToCapsuleView();
      restoreFocus(activeTargetHwnd);
    }
  });

  return win;
}

function switchToCapsuleView(): void {
  if (!companionWindow) return;
  viewState = "capsule";
  companionWindow.setFocusable(false);
  companionWindow.setSize(CAPSULE_WIDTH, CAPSULE_HEIGHT);
  companionWindow.webContents.send("lingual:view-state", "capsule");
}

let lastAnchorPos = { x: 0, y: 0 };

function switchToHudView(targetX: number, targetY: number, autoSent = true): void {
  if (!companionWindow) return;
  viewState = "hud";
  lastAnchorPos = { x: targetX, y: targetY };

  // Focus Policy:
  // If autoSent is true, window is purely ambient read-only, DO NOT steal focus (WS_EX_NOACTIVATE)!
  // If autoSent is false (confirm mode), user needs to press 1/2/Esc, so make it focusable.
  if (autoSent) {
    companionWindow.setFocusable(false);
  } else {
    companionWindow.setFocusable(true);
  }

  const initialHeight = 180;
  companionWindow.setSize(HUD_WIDTH, initialHeight);

  // Roof-docking: default preferAbove = true so it NEVER collides with IME candidate box
  const pos = getClampedPosition(targetX, targetY, HUD_WIDTH, initialHeight, true);
  companionWindow.setPosition(pos.x, pos.y);

  if (autoSent) {
    companionWindow.showInactive();
  } else {
    companionWindow.show();
    companionWindow.focus();
  }
  companionWindow.webContents.send("lingual:view-state", "hud");
}

function switchToSpotlightView(): void {
  if (!companionWindow) return;
  viewState = "spotlight";
  companionWindow.setFocusable(true);
  companionWindow.setSize(HUD_WIDTH, HUD_HEIGHT);

  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const x = Math.round(display.workArea.x + (display.workArea.width - HUD_WIDTH) / 2);
  const y = Math.round(display.workArea.y + display.workArea.height * 0.25);

  companionWindow.setPosition(x, y);
  companionWindow.show();
  companionWindow.focus();
  companionWindow.webContents.send("lingual:view-state", "spotlight");
}

/**
 * Ambient Caret Tracker:
 * Periodically checks caret or focused element position to gently dock the micro-capsule
 */
function startCaretTracking(): void {
  if (caretPollInterval) clearInterval(caretPollInterval);

  caretPollInterval = setInterval(() => {
    if (viewState !== "capsule" || !companionWindow) return;

    const config = loadDesktopConfig();
    if (!config.showCapsule || currentMode === "off") {
      if (companionWindow.isVisible()) companionWindow.hide();
      return;
    }

    const caret = getCaretPosition();
    if (caret) {
      const display = screen.getDisplayNearestPoint(caret);
      const x = Math.min(caret.x + 8, display.workArea.x + display.workArea.width - CAPSULE_WIDTH - 4);
      const y = Math.max(display.workArea.y + 4, caret.y - CAPSULE_HEIGHT - 4);

      companionWindow.setPosition(Math.round(x), Math.round(y));
      if (!companionWindow.isVisible()) {
        companionWindow.showInactive();
      }
      return;
    }

    const rect = getFocusedElementRect();
    if (rect && rect.width > 0 && rect.height > 0) {
      const display = screen.getDisplayNearestPoint({ x: rect.x, y: rect.y });
      const x = Math.min(rect.x + rect.width - CAPSULE_WIDTH, display.workArea.x + display.workArea.width - CAPSULE_WIDTH - 4);
      const y = Math.max(display.workArea.y + 4, rect.y - CAPSULE_HEIGHT - 2);

      companionWindow.setPosition(Math.round(x), Math.round(y));
      if (!companionWindow.isVisible()) {
        companionWindow.showInactive();
      }
      return;
    }

    // If no active typing control detected, gracefully hide capsule
    if (companionWindow.isVisible()) {
      companionWindow.hide();
    }
  }, 350);
}

function cycleCompanionMode(): void {
  const modes: CompanionMode[] = ["english", "original", "off"];
  const nextIdx = (modes.indexOf(currentMode) + 1) % modes.length;
  currentMode = modes[nextIdx];
  saveDesktopConfig({ mode: currentMode });

  if (companionWindow) {
    companionWindow.webContents.send("lingual:mode-changed", currentMode);
  }
  updateTrayMenu();
  console.log(`[lingual-desktop] Mode cycled to: ${currentMode}`);
}

async function handleSubmitInterception(): Promise<void> {
  const targetHwnd = getActiveWindowHwnd();
  activeTargetHwnd = targetHwnd;

  if (currentMode === "off") return;

  // IME Composition Guard:
  // If input method is currently composing text (e.g. typing pinyin or candidate list open),
  // 0ms pass-through immediately, NEVER intercept or interfere!
  if (isImeComposing()) {
    return;
  }

  const captured = await captureActiveInputText(clipboard);
  if (!captured || !captured.text.trim()) {
    return;
  }

  activeBackupText = captured.backup;
  const config = loadDesktopConfig();

  // Check if natural language should trigger translation
  if (!shouldTriggerTranslation(captured.text, config.sourceLang)) {
    return;
  }

  const caret = getCaretPosition();
  const cursor = screen.getCursorScreenPoint();
  const pos = caret || cursor;

  // Mode A: Original Mode (0ms pass-through, HUD explains in background without stealing focus)
  if (currentMode === "original") {
    switchToHudView(pos.x, pos.y, true);
    if (companionWindow) {
      companionWindow.webContents.send("lingual:data", {
        loading: true,
        sourceText: captured.text,
        autoSent: true,
        modeLabel: "Original",
      });
    }

    executeTranslation(captured.text, config)
      .then((res) => {
        currentTranslationResponse = res;
        if (companionWindow && companionWindow.isVisible()) {
          companionWindow.webContents.send("lingual:data", {
            ...res,
            sourceText: captured.text,
            autoSent: true,
            modeLabel: "Original",
          });
        }
      })
      .catch((err) => console.error("[main] Translation error:", err));
    return;
  }

  // Mode B: English Mode (Intercept -> Translate -> Replace & Send / Confirm)
  switchToHudView(pos.x, pos.y, config.autoSend);
  if (companionWindow) {
    companionWindow.webContents.send("lingual:data", {
      loading: true,
      sourceText: captured.text,
      autoSent: config.autoSend,
      modeLabel: "English",
    });
  }

  try {
    const res = await executeTranslation(captured.text, config);
    currentTranslationResponse = res;
    const replacement = res.written || res.spoken;

    if (config.autoSend) {
      // Auto-Send Pipeline:
      if (replacement) {
        await injectTextToTarget(replacement, targetHwnd, activeBackupText, clipboard);
        setTimeout(() => triggerPaste(), 60);
      }
      if (companionWindow && companionWindow.isVisible()) {
        companionWindow.webContents.send("lingual:data", {
          ...res,
          sourceText: captured.text,
          autoSent: true,
          modeLabel: "Submitted",
        });
      }
    } else {
      // Confirm-before-send Pipeline:
      if (companionWindow && companionWindow.isVisible()) {
        companionWindow.webContents.send("lingual:data", {
          ...res,
          sourceText: captured.text,
          autoSent: false,
          modeLabel: "Ready",
        });
      }
    }
  } catch (err: any) {
    console.error("[main] English translation interception error:", err);
    switchToCapsuleView();
    restoreFocus(targetHwnd);
  }
}

function registerShortcuts(config: LingualDesktopConfig): void {
  globalShortcut.unregisterAll();

  // 1. Mode cycle shortcut (Alt+Q)
  const toggleKey = config.hotkeyToggleMode || "Alt+Q";
  globalShortcut.register(toggleKey, () => {
    cycleCompanionMode();
  });

  // 2. Submit interceptor shortcut (Ctrl+Enter)
  const submitKey = config.hotkeySubmit || "Ctrl+Enter";
  globalShortcut.register(submitKey, () => {
    handleSubmitInterception();
  });

  // 3. Selection rewrite shortcut (Alt+E)
  const rewriteKey = config.hotkeyRewrite || "Alt+E";
  globalShortcut.register(rewriteKey, () => {
    handleSubmitInterception();
  });

  // 4. Spotlight capsule shortcut (Alt+Space)
  const spotlightKey = config.hotkeySpotlight || "Alt+Space";
  globalShortcut.register(spotlightKey, () => {
    switchToSpotlightView();
  });
}

function updateTrayMenu(): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `⇄ Current Mode: [${currentMode.toUpperCase()}]`,
      enabled: false,
    },
    {
      label: "Cycle Mode (Alt+Q)",
      click: () => cycleCompanionMode(),
    },
    { type: "separator" },
    {
      label: "Mode: English (Auto-translate & Submit)",
      type: "radio",
      checked: currentMode === "english",
      click: () => {
        currentMode = "english";
        saveDesktopConfig({ mode: "english" });
        if (companionWindow) companionWindow.webContents.send("lingual:mode-changed", "english");
        updateTrayMenu();
      },
    },
    {
      label: "Mode: Original (Send original + Learn)",
      type: "radio",
      checked: currentMode === "original",
      click: () => {
        currentMode = "original";
        saveDesktopConfig({ mode: "original" });
        if (companionWindow) companionWindow.webContents.send("lingual:mode-changed", "original");
        updateTrayMenu();
      },
    },
    {
      label: "Mode: Off",
      type: "radio",
      checked: currentMode === "off",
      click: () => {
        currentMode = "off";
        saveDesktopConfig({ mode: "off" });
        if (companionWindow) companionWindow.webContents.send("lingual:mode-changed", "off");
        updateTrayMenu();
      },
    },
    { type: "separator" },
    {
      label: "Auto-Send after Translation",
      type: "checkbox",
      checked: loadDesktopConfig().autoSend,
      click: (item) => {
        saveDesktopConfig({ autoSend: item.checked });
      },
    },
    {
      label: "Show Ambient Caret Capsule",
      type: "checkbox",
      checked: loadDesktopConfig().showCapsule,
      click: (item) => {
        saveDesktopConfig({ showCapsule: item.checked });
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function setupTray(): void {
  tray = new Tray(path.join(__dirname, "../../assets/tray-icon.png"));
  tray.setToolTip("lingual-desktop · Ambient Language Companion");
  updateTrayMenu();
}

function setupIpc(): void {
  ipcMain.on("lingual:resize-hud", (_event, measuredHeight: number) => {
    if (viewState !== "hud" || !companionWindow) return;
    const clampedHeight = Math.max(140, Math.min(340, Math.ceil(measuredHeight)));
    companionWindow.setSize(HUD_WIDTH, clampedHeight);

    // Re-dock with Roof-Docking respecting new height
    if (lastAnchorPos.x > 0 || lastAnchorPos.y > 0) {
      const pos = getClampedPosition(lastAnchorPos.x, lastAnchorPos.y, HUD_WIDTH, clampedHeight, true);
      companionWindow.setPosition(pos.x, pos.y);
    }
  });

  ipcMain.on("lingual:toggle-mode", () => {
    cycleCompanionMode();
  });

  ipcMain.on("lingual:select", async (_event, slot: 1 | 2) => {
    if (!currentTranslationResponse) {
      switchToCapsuleView();
      restoreFocus(activeTargetHwnd);
      return;
    }

    const selectedText = slot === 1
      ? currentTranslationResponse.spoken
      : currentTranslationResponse.written;

    switchToCapsuleView();

    if (selectedText) {
      await injectTextToTarget(selectedText, activeTargetHwnd, activeBackupText, clipboard);
      setTimeout(() => triggerPaste(), 40);
    } else {
      restoreFocus(activeTargetHwnd);
    }
  });

  ipcMain.on("lingual:dismiss", () => {
    switchToCapsuleView();
    restoreFocus(activeTargetHwnd);
  });

  ipcMain.on("lingual:submit-spotlight", async (_event, input: string) => {
    try {
      const res = await executeTranslation(input);
      currentTranslationResponse = res;
      if (companionWindow && companionWindow.isVisible()) {
        companionWindow.webContents.send("lingual:data", {
          ...res,
          sourceText: input,
          autoSent: false,
          modeLabel: "Spotlight",
        });
      }
    } catch (err: any) {
      console.error("[main] Spotlight translation error:", err);
    }
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    const config = loadDesktopConfig();
    currentMode = config.mode || "english";

    companionWindow = createCompanionWindow();
    registerShortcuts(config);
    setupTray();
    setupIpc();
    startCaretTracking();

    console.log(`[lingual-desktop] Initialized ambient companion in [${currentMode}] mode.`);
  });

  app.on("will-quit", () => {
    if (caretPollInterval) clearInterval(caretPollInterval);
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", (e: Event) => {
    e.preventDefault();
  });
}
