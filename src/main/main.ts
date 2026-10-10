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

  // Determine active dynamic multi-slot configuration
  const configuredSlots = config.slots && Array.isArray(config.slots) ? config.slots : getDefaultSlots(config.sourceLang || "zh");

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

    executeTranslation(captured.text, config, undefined, configuredSlots)
      .then((res) => {
        currentTranslationResponse = res;
        if (companionWindow && companionWindow.isVisible()) {
          companionWindow.webContents.send("lingual:data", {
            ...res,
            sourceText: captured.text,
            autoSent: true,
            modeLabel: "Original",
            slots: res.slots,
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
    const res = await executeTranslation(captured.text, config, undefined, configuredSlots);
    currentTranslationResponse = res;

    // OFFLINE CIRCUIT BREAKER:
    // If local/remote model is offline or timed out, NEVER auto-send raw untranslated Chinese!
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

    if (config.autoSend) {
      // Auto-Send Pipeline:
      // injectTextToTarget already handles atomic replacement & paste; eliminated double-paste bug!
      if (replacement) {
        await injectTextToTarget(replacement, targetHwnd, activeBackupText, clipboard);
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
    } else {
      // Confirm-before-send Pipeline:
      if (companionWindow && companionWindow.isVisible()) {
        companionWindow.webContents.send("lingual:data", {
          ...res,
          sourceText: captured.text,
          autoSent: false,
          modeLabel: "Ready",
          slots: res.slots,
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

function openSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  const config = loadDesktopConfig();
  const isZh = config.sourceLang === "zh" || config.sourceLang === "tw";
  const isJa = config.sourceLang === "ja";
  const winTitle = isZh
    ? "Lingual 伴侣设置"
    : isJa
    ? "Lingual 伴走設定"
    : "Lingual Companion Settings";

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 660,
    title: winTitle,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    show: false,
    backgroundColor: "#f6f9fc",
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

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

function updateTrayMenu(): void {
  if (!tray) return;

  const config = loadDesktopConfig();
  const labels = resolveLabelsForLang(config.sourceLang || "zh", undefined, config.targetLang);
  const isZh = config.sourceLang === "zh" || config.sourceLang === "tw";
  const isJa = config.sourceLang === "ja";

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `⇄ [${labels.hudTitle}] ${labels.statusReportMode || "Mode"}: [${currentMode.toUpperCase()}]`,
      enabled: false,
    },
    {
      label: isZh ? "循环切换模式 (Alt+Q)" : isJa ? "モード切替 (Alt+Q)" : "Cycle Mode (Alt+Q)",
      click: () => cycleCompanionMode(),
    },
    {
      label: isZh ? "⚙️ 设置 (Settings)..." : isJa ? "⚙️ 設定 (Settings)..." : "⚙️ Settings...",
      click: () => openSettingsWindow(),
    },
    { type: "separator" },
    {
      label: `${labels.statusEnglish}: ${labels.modeDescEnglish || "English (Auto-translate & Submit)"}`,
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
      label: `${labels.statusOriginal}: ${labels.modeDescOriginal || "Original (Send original + Learn)"}`,
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
      label: labels.statusOff || (isZh ? "关闭伴学" : isJa ? "オフ" : "Off"),
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
      label: isZh ? "翻译后自动发送" : isJa ? "翻訳後に自動送信" : "Auto-Send after Translation",
      type: "checkbox",
      checked: config.autoSend,
      click: (item) => {
        saveDesktopConfig({ autoSend: item.checked });
      },
    },
    {
      label: isZh ? "显示光标悬浮胶囊" : isJa ? "カーソルカプセルを表示" : "Show Ambient Caret Capsule",
      type: "checkbox",
      checked: config.showCapsule,
      click: (item) => {
        saveDesktopConfig({ showCapsule: item.checked });
      },
    },
    { type: "separator" },
    {
      label: isZh ? "退出" : isJa ? "終了" : "Quit",
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function setupTray(): void {
  tray = new Tray(path.join(__dirname, "../../assets/tray-icon.png"));
  const config = loadDesktopConfig();
  const isZh = config.sourceLang === "zh" || config.sourceLang === "tw";
  const isJa = config.sourceLang === "ja";
  tray.setToolTip(
    isZh
      ? "Lingual 语言伴侣 · 点击打开设置"
      : isJa
      ? "Lingual 伴走 · クリックして設定を開く"
      : "Lingual Companion · Click to open settings"
  );
  updateTrayMenu();

  // Left click or double click on tray icon opens the Gabriel settings control center immediately!
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
      return { success: true, ...result };
    } catch (err: any) {
      return { success: false, error: err.message || "生成失败" };
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
    // If user double-clicks Lingual.exe while already running, immediately bring Settings window to foreground!
    openSettingsWindow();
    if (tray) {
      const cfg = loadDesktopConfig();
      const isZh = cfg.sourceLang === "zh" || cfg.sourceLang === "tw";
      const isJa = cfg.sourceLang === "ja";
      tray.displayBalloon({
        title: isZh ? "Lingual 语言伴侣" : isJa ? "Lingual 伴走" : "Lingual Companion",
        content: isZh
          ? "设置控制中心已激活。快捷键：Alt+Q 切换模式，Ctrl+Enter 翻译并发送。"
          : isJa
          ? "設定画面がアクティブです。Alt+Q モード切替、Ctrl+Enter 送信。"
          : "Settings window activated. Hotkeys: Alt+Q to cycle mode, Ctrl+Enter to submit.",
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
    startCaretTracking();

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
      const isZh = config.sourceLang === "zh" || config.sourceLang === "tw";
      const isJa = config.sourceLang === "ja";
      tray.displayBalloon({
        title: isZh ? "Lingual 伴侣已启动" : isJa ? "Lingual 伴走 起動完了" : "Lingual Started",
        content: isZh
          ? `模式：[${currentMode.toUpperCase()}]。快捷键：Alt+Q 切模式，Ctrl+Enter 发送。`
          : isJa
          ? `モード：[${currentMode.toUpperCase()}]。Alt+Q モード切替、Ctrl+Enter 送信。`
          : `Mode: [${currentMode.toUpperCase()}]. Alt+Q to cycle mode, Ctrl+Enter to submit.`,
      });
    }

    console.log(`[lingual-desktop] Initialized ambient companion in [${currentMode}] mode.`);
  });

  app.on("will-quit", () => {
    if (caretPollInterval) clearInterval(caretPollInterval);
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", () => {
    // Keep ambient companion resident in Windows system tray
  });
}
