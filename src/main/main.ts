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
  triggerEnter,
  isImeComposing,
} from "./win32.js";
import {
  executeTranslation,
  shouldTriggerTranslation,
  generateSlotsFromUserIntent,
  detectLocalEndpoints,
} from "./engine.js";
import { SLOT_PRESETS, getDefaultSlots } from "pi-lingual/core";
import { resolveLabelsForLang } from "pi-lingual";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let companionWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

let currentMode: CompanionMode = "english";
let activeTargetHwnd = "0";
let activeBackupText = "";
let currentTranslationResponse: any = null;
let viewState: "capsule" | "hud" | "spotlight" = "capsule";

const CAPSULE_WIDTH = 84;
const CAPSULE_HEIGHT = 30;
const HUD_WIDTH = 540;
const HUD_HEIGHT = 280;

let currentCapsulePos = { x: 0, y: 0 };

function getInitialCapsulePos(config: LingualDesktopConfig): { x: number; y: number } {
  if (config.capsulePos && typeof config.capsulePos.x === "number" && typeof config.capsulePos.y === "number") {
    return { x: Math.round(config.capsulePos.x), y: Math.round(config.capsulePos.y) };
  }
  try {
    const primary = screen.getPrimaryDisplay();
    return {
      x: Math.round(primary.workArea.x + primary.workArea.width - CAPSULE_WIDTH - 24),
      y: Math.round(primary.workArea.y + 40),
    };
  } catch {
    return { x: 100, y: 100 };
  }
}

function createCompanionWindow(): BrowserWindow {
  const config = loadDesktopConfig();
  currentCapsulePos = getInitialCapsulePos(config);

  const win = new BrowserWindow({
    width: CAPSULE_WIDTH,
    height: CAPSULE_HEIGHT,
    x: currentCapsulePos.x,
    y: currentCapsulePos.y,
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

  win.once("ready-to-show", () => {
    if (config.showCapsule !== false && currentMode !== "off") {
      win.showInactive();
    }
  });

  return win;
}

function switchToCapsuleView(): void {
  if (!companionWindow) return;
  viewState = "capsule";
  companionWindow.setFocusable(false);
  companionWindow.setSize(CAPSULE_WIDTH, CAPSULE_HEIGHT);
  companionWindow.setPosition(currentCapsulePos.x, currentCapsulePos.y);
  companionWindow.webContents.send("lingual:view-state", "capsule");
  if (currentMode !== "off") {
    companionWindow.showInactive();
  } else {
    companionWindow.hide();
  }
}

function getClampedPosition(targetPhysicalX: number, targetPhysicalY: number, winWidth: number, winHeight: number, preferAbove = true): { x: number; y: number } {
  // Convert physical screen coordinates to Electron DIP coordinate space to prevent 1.5x coordinate drift on High-DPI screens
  const display = screen.getDisplayNearestPoint({ x: targetPhysicalX, y: targetPhysicalY });
  const scale = display.scaleFactor || 1.0;
  const dipTargetX = targetPhysicalX / scale;
  const dipTargetY = targetPhysicalY / scale;
  const { workArea } = display; // workArea operates strictly in DIPs

  // 1. Horizontal Clamping (prevent sticking off the right or left edge)
  let x = dipTargetX + 10;
  if (x + winWidth > workArea.x + workArea.width - 12) {
    // Flip to the left of target point if right edge is exceeded
    x = Math.max(workArea.x + 12, dipTargetX - winWidth - 10);
  }

  // 2. Vertical Positioning (Roof-Docking: prefer above the caret to strictly avoid IME candidate box overlap!)
  let y = preferAbove ? dipTargetY - winHeight - 8 : dipTargetY + 20;

  // If above goes past top edge, flip to below
  if (y < workArea.y + 12) {
    y = dipTargetY + 24;
  }
  // If below goes past bottom edge, clamp inside
  if (y + winHeight > workArea.y + workArea.height - 12) {
    y = workArea.y + workArea.height - winHeight - 12;
  }

  return { x: Math.round(x), y: Math.round(y) };
}

let lastAnchorPos = { x: 0, y: 0 };

function switchToHudView(targetX: number, targetY: number, autoSent = true): void {
  if (!companionWindow) return;
  viewState = "hud";

  if (autoSent) {
    companionWindow.setFocusable(false);
  } else {
    companionWindow.setFocusable(true);
  }

  const initialHeight = 180;
  companionWindow.setSize(HUD_WIDTH, initialHeight);

  // If a valid caret coordinate was captured, dock near caret; otherwise anchor from current draggable capsule position
  const anchorX = targetX > 0 ? targetX : currentCapsulePos.x;
  const anchorY = targetY > 0 ? targetY : currentCapsulePos.y;
  lastAnchorPos = { x: anchorX, y: anchorY };

  const pos = getClampedPosition(anchorX, anchorY, HUD_WIDTH, initialHeight, true);
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
 * Periodically checks caret position using purely native C helper (<0.2ms)
 * Strictly avoids spawning .NET CLR uia_helper.exe in high-frequency loop to prevent laptop battery cremation
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

    // Pure lightweight Win32 probe: 0.1ms, zero CLR allocation, 0.0% idle CPU
    const caret = getCaretPosition();
    if (caret) {
      const display = screen.getDisplayNearestPoint(caret);
      const scale = display.scaleFactor || 1.0;
      const dipX = caret.x / scale;
      const dipY = caret.y / scale;

      const x = Math.min(dipX + 8, display.workArea.x + display.workArea.width - CAPSULE_WIDTH - 4);
      const y = Math.max(display.workArea.y + 4, dipY - CAPSULE_HEIGHT - 4);

      companionWindow.setPosition(Math.round(x), Math.round(y));
      if (!companionWindow.isVisible()) {
        companionWindow.showInactive();
      }
      return;
    }

    // If caret is not reported (e.g. non-editing window or browser chrome), gracefully hide capsule
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
  registerShortcuts(loadDesktopConfig());

  if (companionWindow) {
    companionWindow.webContents.send("lingual:mode-changed", currentMode);
  }
  updateTrayMenu();
  console.log(`[lingual-desktop] Mode cycled to: ${currentMode}`);
}

let isSubmittingSyntheticEnter = false;

function sendNativeEnterSafe(): void {
  isSubmittingSyntheticEnter = true;
  try {
    globalShortcut.unregister("Enter");
  } catch {}
  triggerEnter();
  setTimeout(() => {
    isSubmittingSyntheticEnter = false;
    registerShortcuts(loadDesktopConfig());
  }, 80);
}

async function handleSubmitInterception(allowSelectAll = true, fromEnterKey = false): Promise<void> {
  if (isSubmittingSyntheticEnter) return;

  const config = loadDesktopConfig();

  // Do not hijack Enter inside our own Settings window
  if (settingsWindow && !settingsWindow.isDestroyed() && settingsWindow.isFocused()) {
    if (fromEnterKey) sendNativeEnterSafe();
    return;
  }

  const targetHwnd = getActiveWindowHwnd();
  activeTargetHwnd = targetHwnd;

  if (currentMode === "off") {
    if (fromEnterKey) sendNativeEnterSafe();
    return;
  }

  // IME Composition Guard:
  // If input method is currently composing text (e.g. typing pinyin or candidate list open),
  // 0ms pass-through immediately, NEVER intercept or interfere!
  if (isImeComposing()) {
    if (fromEnterKey) sendNativeEnterSafe();
    return;
  }

  const captured = await captureActiveInputText(clipboard, allowSelectAll);
  if (!captured || !captured.text.trim()) {
    if (fromEnterKey) sendNativeEnterSafe();
    return;
  }

  activeBackupText = captured.backup;

  // Smart Chinese / Native Language Detection:
  const hasChinese = /[\u4e00-\u9fff]/.test(captured.text);
  const effectiveSourceLang =
    hasChinese && config.targetLang !== "zh" ? "zh" : config.sourceLang || "zh";

  if (!hasChinese && !shouldTriggerTranslation(captured.text, effectiveSourceLang)) {
    if (fromEnterKey) sendNativeEnterSafe();
    return;
  }

  const effectiveConfig = { ...config, sourceLang: effectiveSourceLang };

  const caret = getCaretPosition();
  const cursor = screen.getCursorScreenPoint();
  const pos = caret || cursor;

  // Determine active dynamic multi-slot configuration
  const configuredSlots =
    effectiveConfig.slots && Array.isArray(effectiveConfig.slots)
      ? effectiveConfig.slots
      : getDefaultSlots(effectiveSourceLang);

  // Mode A: Learn / Original Mode (0ms pass-through Enter, HUD explains in background)
  if (currentMode === "original") {
    if (fromEnterKey) sendNativeEnterSafe();
    switchToHudView(pos.x, pos.y, true);
    if (companionWindow) {
      companionWindow.webContents.send("lingual:data", {
        loading: true,
        sourceText: captured.text,
        autoSent: true,
        modeLabel: "Learn",
      });
    }

    executeTranslation(captured.text, effectiveConfig, undefined, configuredSlots)
      .then((res) => {
        currentTranslationResponse = res;
        if (companionWindow && companionWindow.isVisible()) {
          companionWindow.webContents.send("lingual:data", {
            ...res,
            sourceText: captured.text,
            autoSent: true,
            modeLabel: "Learn",
            slots: res.slots,
          });
        }
      })
      .catch((err) => console.error("[main] Translation error:", err));
    return;
  }

  // Mode B: Translate Mode (Intercept Enter -> Translate -> Replace & Submit Enter + HUD)
  switchToHudView(pos.x, pos.y, true);
  if (companionWindow) {
    companionWindow.webContents.send("lingual:data", {
      loading: true,
      sourceText: captured.text,
      autoSent: true,
      modeLabel: "Translating",
    });
  }

  try {
    const res = await executeTranslation(captured.text, effectiveConfig, undefined, configuredSlots);
    currentTranslationResponse = res;

    if (res.isOfflineOrFailed) {
      if (companionWindow && companionWindow.isVisible()) {
        companionWindow.webContents.send("lingual:data", {
          sourceText: captured.text,
          spoken: captured.text,
          written: captured.text,
          autoSent: false,
          modeLabel: "Offline",
          slots: res.slots,
        });
      }
      return;
    }

    const replacement = res.written || res.spoken;

    if (replacement) {
      isSubmittingSyntheticEnter = true;
      try {
        globalShortcut.unregister("Enter");
      } catch {}
      await injectTextToTarget(replacement, targetHwnd, activeBackupText, clipboard, fromEnterKey);
      setTimeout(() => {
        isSubmittingSyntheticEnter = false;
        registerShortcuts(loadDesktopConfig());
      }, 80);
    }

    if (companionWindow && companionWindow.isVisible()) {
      companionWindow.webContents.send("lingual:data", {
        ...res,
        sourceText: captured.text,
        autoSent: true,
        modeLabel: "Submitted",
        slots: res.slots,
      });
    }
  } catch (err: any) {
    console.error("[main] Translation interception error:", err);
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

  // 2. Just like pi-lingual: When in Translate or Learn mode, pressing Enter inspects and dispatches!
  //    (Ctrl+Enter and Shift+Enter are never registered, so newlines remain 100% native.)
  if (currentMode !== "off") {
    globalShortcut.register("Enter", () => {
      handleSubmitInterception(true, true);
    });
  }

  // 3. Optional selection rewrite shortcut (Alt+E)
  const rewriteKey = config.hotkeyRewrite || "Alt+E";
  globalShortcut.register(rewriteKey, () => {
    handleSubmitInterception(false, false);
  });

  // 4. Spotlight capsule shortcut (Alt+Space)
  const spotlightKey = config.hotkeySpotlight || "Alt+Space";
  globalShortcut.register(spotlightKey, () => {
    switchToSpotlightView();
  });
}

function openSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 680,
    height: 700,
    minWidth: 620,
    minHeight: 580,
    title: "Lingual Settings",
    resizable: true,
    minimizable: true,
    maximizable: false,
    autoHideMenuBar: true,
    show: false,
    backgroundColor: "#fbfaf8",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const settingsHtml = path.join(__dirname, "../../src/renderer/settings.html");
  settingsWindow.loadFile(settingsHtml);

  settingsWindow.once("ready-to-show", () => {
    settingsWindow?.show();
    settingsWindow?.focus();
  });

  settingsWindow.on("focus", () => {
    try {
      globalShortcut.unregister("Enter");
    } catch {}
  });

  settingsWindow.on("blur", () => {
    registerShortcuts(loadDesktopConfig());
  });

  settingsWindow.on("closed", () => {
    settingsWindow = null;
    registerShortcuts(loadDesktopConfig());
  });
}

function updateTrayMenu(): void {
  if (!tray) return;

  const config = loadDesktopConfig();
  const modeDisplay = currentMode === "english" ? "TRANSLATE" : currentMode === "original" ? "LEARN" : "OFF";

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Lingual · Mode: [${modeDisplay}]`,
      enabled: false,
    },
    {
      label: "Cycle Mode (Alt+Q)",
      click: () => cycleCompanionMode(),
    },
    {
      label: "Settings...",
      click: () => openSettingsWindow(),
    },
    { type: "separator" },
    {
      label: "Translate (Press Enter -> Translate & Send)",
      type: "radio",
      checked: currentMode === "english",
      click: () => {
        currentMode = "english";
        saveDesktopConfig({ mode: "english" });
        registerShortcuts(loadDesktopConfig());
        if (companionWindow) companionWindow.webContents.send("lingual:mode-changed", "english");
        updateTrayMenu();
      },
    },
    {
      label: "Learn (Press Enter -> Send Original + Card)",
      type: "radio",
      checked: currentMode === "original",
      click: () => {
        currentMode = "original";
        saveDesktopConfig({ mode: "original" });
        registerShortcuts(loadDesktopConfig());
        if (companionWindow) companionWindow.webContents.send("lingual:mode-changed", "original");
        updateTrayMenu();
      },
    },
    {
      label: "Off",
      type: "radio",
      checked: currentMode === "off",
      click: () => {
        currentMode = "off";
        saveDesktopConfig({ mode: "off" });
        registerShortcuts(loadDesktopConfig());
        if (companionWindow) companionWindow.webContents.send("lingual:mode-changed", "off");
        updateTrayMenu();
      },
    },
    { type: "separator" },
    {
      label: "Replace Directly",
      type: "checkbox",
      checked: config.autoSend,
      click: (item) => {
        saveDesktopConfig({ autoSend: item.checked });
      },
    },
    {
      label: "Show Caret Capsule",
      type: "checkbox",
      checked: config.showCapsule,
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
  tray.setToolTip("Lingual · Click to open settings");
  updateTrayMenu();

  tray.on("click", () => openSettingsWindow());
  tray.on("double-click", () => openSettingsWindow());
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

  ipcMain.on("lingual:select", async (_event, slot: number) => {
    if (!currentTranslationResponse) {
      switchToCapsuleView();
      restoreFocus(activeTargetHwnd);
      return;
    }

    let selectedText = "";
    if (Array.isArray(currentTranslationResponse.slots)) {
      const transSlots = currentTranslationResponse.slots.filter(
        (s: any) => s.role === "translation" || s.role === "custom"
      );
      const chosen = transSlots[slot - 1];
      if (chosen) {
        selectedText = chosen.content;
      }
    }

    if (!selectedText) {
      selectedText = slot === 1
        ? currentTranslationResponse.spoken
        : currentTranslationResponse.written;
    }

    switchToCapsuleView();

    if (selectedText) {
      await injectTextToTarget(selectedText, activeTargetHwnd, activeBackupText, clipboard);
    } else {
      restoreFocus(activeTargetHwnd);
    }
  });

  ipcMain.on("lingual:close-settings", () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.close();
    }
  });

  ipcMain.handle("lingual:get-config", async () => {
    return loadDesktopConfig();
  });

  ipcMain.handle("lingual:save-config", async (_event, patch: any) => {
    saveDesktopConfig(patch);
    const updated = loadDesktopConfig();
    currentMode = updated.mode || currentMode;
    registerShortcuts(updated);
    updateTrayMenu();
    if (companionWindow && !companionWindow.isDestroyed()) {
      companionWindow.webContents.send("lingual:mode-changed", currentMode);
    }
    console.log("[lingual-desktop] Config updated and hot-reloaded:", patch);
    return { success: true };
  });

  ipcMain.handle("lingual:test-connection", async (_event, params: any) => {
    const { endpoint, apiKey, model } = params;
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint || "http://127.0.0.1:11434/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && apiKey !== "ollama" ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: model || "qwen2.5:3b",
          messages: [
            { role: "system", content: "You are a test probe. Answer with OK." },
            { role: "user", content: "ping" },
          ],
          max_tokens: 5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (res.ok) {
        return { success: true, latencyMs };
      } else {
        return { success: false, latencyMs, error: `HTTP ${res.status} ${res.statusText}` };
      }
    } catch (err: any) {
      return { success: false, latencyMs: Date.now() - start, error: err.message || "连接失败" };
    }
  });

  ipcMain.handle("lingual:ai-tune-slots", async (_event, promptText: string) => {
    try {
      const result = await generateSlotsFromUserIntent(promptText);
      if (result && Array.isArray(result.slots) && result.slots.length > 0) {
        saveDesktopConfig({ slots: result.slots });
      }
      return { success: true, ...result };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to generate layout" };
    }
  });

  ipcMain.handle("lingual:detect-local-ai", async () => {
    try {
      const detected = await detectLocalEndpoints();
      return { success: true, ...detected };
    } catch (err: any) {
      return { success: false, ollama: false, lmstudio: false, vllm: false };
    }
  });

  ipcMain.on("lingual:undo", async () => {
    if (activeBackupText && activeTargetHwnd !== "0") {
      await injectTextToTarget(activeBackupText, activeTargetHwnd, "", clipboard);
    }
    switchToCapsuleView();
    restoreFocus(activeTargetHwnd);
  });

  ipcMain.on("lingual:dismiss", () => {
    switchToCapsuleView();
    restoreFocus(activeTargetHwnd);
  });

  ipcMain.on("lingual:drag-move", (_event, { dx, dy }) => {
    if (!companionWindow) return;
    const [x, y] = companionWindow.getPosition();
    const nextX = Math.round(x + dx);
    const nextY = Math.round(y + dy);
    companionWindow.setPosition(nextX, nextY);
    currentCapsulePos = { x: nextX, y: nextY };
  });

  ipcMain.on("lingual:save-capsule-pos", () => {
    if (currentCapsulePos.x > 0 || currentCapsulePos.y > 0) {
      saveDesktopConfig({ capsulePos: currentCapsulePos });
    }
  });

  ipcMain.on("lingual:open-settings", () => {
    openSettingsWindow();
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
  app.on("second-instance", () => {
    openSettingsWindow();
    if (tray) {
      tray.displayBalloon({
        title: "Lingual",
        content: "Settings window activated. Shortcuts: Alt+Q to cycle mode, Alt+E to translate.",
      });
    }
  });

  app.whenReady().then(() => {
    try {
      app.setAppUserModelId("dev.lingual.desktop");
    } catch {}

    const config = loadDesktopConfig();
    currentMode = config.mode || "english";

    companionWindow = createCompanionWindow();
    registerShortcuts(config);
    setupTray();
    setupIpc();

    // Enable Windows autostart on boot (silent mode)
    try {
      app.setLoginItemSettings({
        openAtLogin: true,
        args: ["--hidden"],
      });
    } catch {}

    // First launch or manual double-click: OPEN SETTINGS WINDOW IMMEDIATELY so user gets immediate visual feedback!
    const isSilent = process.argv.includes("--hidden");
    if (!isSilent) {
      openSettingsWindow();
    } else if (tray) {
      tray.displayBalloon({
        title: "Lingual Started",
        content: `Mode: [${currentMode.toUpperCase()}]. Alt+Q to cycle mode, Alt+E to translate.`,
      });
    }

    console.log(`[lingual-desktop] Initialized ambient companion in [${currentMode}] mode.`);
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", () => {
    // Keep ambient companion resident in Windows system tray
  });
}
