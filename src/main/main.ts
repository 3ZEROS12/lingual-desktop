import { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen, clipboard } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDesktopConfig, saveDesktopConfig, type LingualDesktopConfig, type CompanionMode } from "./config.js";
import {
  getActiveWindowHwnd,
  restoreFocus,
  getCaretPosition,
  getFocusedElementRect,
  getFocusedElementRectAsync,
  getCaretPositionAsync,
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

let capsuleWindow: BrowserWindow | null = null;
let hudWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

let currentMode: CompanionMode = "english";
let activeTargetHwnd = "0";
let activeBackupText = "";
let currentTranslationResponse: any = null;
let viewState: "idle" | "hud" | "spotlight" = "idle";

const CAPSULE_WIDTH = 96;
const CAPSULE_HEIGHT = 30;
const HUD_WIDTH = 540;
const HUD_HEIGHT = 280;

let currentCapsulePos = { x: 0, y: 0 };
let inputTrackerInterval: NodeJS.Timeout | null = null;
let lastPebblePos = { x: 0, y: 0 };
let isProbingFocus = false;

function getInitialCapsulePos(config: LingualDesktopConfig): { x: number; y: number } {
  if (config.capsulePos && typeof config.capsulePos.x === "number" && typeof config.capsulePos.y === "number") {
    return { x: Math.round(config.capsulePos.x), y: Math.round(config.capsulePos.y) };
  }
  try {
    const primary = screen.getPrimaryDisplay();
    return {
      x: Math.round(primary.workArea.x + primary.workArea.width - CAPSULE_WIDTH - 20),
      y: Math.round(primary.workArea.y + primary.workArea.height - CAPSULE_HEIGHT - 60),
    };
  } catch {
    return { x: 100, y: 100 };
  }
}

/**
 * In-Situ Roof-Docked Floating Pebble (聚焦输入框时浮现在光标/输入框正上方)
 * 平时不打字时静默隐藏；聚焦到任意输入框时，在输入框正上方轻巧浮现 (⇄ EN | ⚙)；
 * 左键点击切换模式，右键或齿轮点击打开设置。
 * focusable: true 确保 Chromium DOM 能 100% 捕获点击、悬浮和右键事件；
 * 配合 showInactive() 保证绝不争夺当前输入框打字焦点！
 */
function createCapsuleWindow(): BrowserWindow {
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
    show: false, // 平时不打字时静默，由 inputTracker 在检测到输入框时浮现
    resizable: false,
    focusable: true, // 核心修复：必须为 true，Chromium 才会分发 click 和 contextmenu 事件！
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const capsuleHtml = path.join(__dirname, "../../src/renderer/capsule.html");
  win.loadFile(capsuleHtml);

  return win;
}

function isForegroundLingualWindow(): boolean {
  const fgHwnd = getActiveWindowHwnd();
  if (!fgHwnd || fgHwnd === "0") return false;

  for (const win of [capsuleWindow, hudWindow, settingsWindow]) {
    if (win && !win.isDestroyed()) {
      try {
        const handleBuf = win.getNativeWindowHandle();
        const winHwnd = String(handleBuf.readUInt32LE(0));
        if (winHwnd === fgHwnd) return true;
      } catch {}
    }
  }
  return false;
}

/**
 * 测算微圆标在当前输入框/光标正上方的停靠坐标 (Roof-Docked Pebble Position)
 * 100% 异步非阻塞探针，零阻塞 Node.js 事件循环！
 */
async function calculatePebblePositionAsync(pebbleW = CAPSULE_WIDTH, pebbleH = CAPSULE_HEIGHT): Promise<{ x: number; y: number } | null> {
  // Never track Lingual's own windows (eliminates jitter and self-tracking loop)
  if (isForegroundLingualWindow()) {
    return null;
  }

  const focusedRect = await getFocusedElementRectAsync();
  const caret = !focusedRect ? await getCaretPositionAsync() : null;

  let targetX = 0;
  let targetY = 0;
  let targetH = 24;

  // Filter out giant full-window rectangles (height > 160 means full window/canvas, not an input box)
  if (focusedRect && focusedRect.width > 0 && focusedRect.height > 0 && focusedRect.height < 160) {
    targetX = focusedRect.x;
    targetY = focusedRect.y;
    targetH = focusedRect.height;
  } else if (caret) {
    targetX = caret.x;
    targetY = caret.y;
    targetH = 20;
  } else {
    return null;
  }

  const display = screen.getDisplayNearestPoint({ x: targetX, y: targetY });
  const scale = display.scaleFactor || 1.0;
  const dipX = targetX / scale;
  const dipY = targetY / scale;
  const dipH = targetH / scale;
  const { workArea } = display;

  // 水平靠齐输入框左上边缘
  let x = dipX;
  if (x + pebbleW > workArea.x + workArea.width - 8) {
    x = workArea.x + workArea.width - pebbleW - 8;
  }
  if (x < workArea.x + 8) {
    x = workArea.x + 8;
  }

  // 垂直顶在输入框正上方 6px (若贴顶则翻转到正下方)
  let y = dipY - pebbleH - 6;
  if (y < workArea.y + 8) {
    y = dipY + dipH + 6;
  }

  return { x: Math.round(x), y: Math.round(y) };
}

/**
 * 实时聚焦探测器：检测用户是否处于可编辑输入框中
 * - 处于输入框打字：在正上方轻巧浮现小圆标；
 * - 离开输入框/点击桌面：自动淡出隐去，保持桌面 100% 干净；
 * - 伴学关闭(OFF)或配置关闭(showCapsule=false)：100% 隐藏，绝不残留；
 * - 聚焦在 Lingual 自己的窗口时：绝不自追踪，杜绝上下抖动！
 * - 100% 非阻塞异步探针，零阻塞 Node.js 主事件循环，彻底消除卡顿！
 */
function startInputTracker(): void {
  if (inputTrackerInterval) clearInterval(inputTrackerInterval);

  inputTrackerInterval = setInterval(async () => {
    if (!capsuleWindow || capsuleWindow.isDestroyed()) return;

    // 1. 如果处于 HUD 翻译卡片展开状态、或者伴学已关闭(OFF)
    if (viewState !== "idle" || currentMode === "off") {
      if (capsuleWindow.isVisible()) {
        capsuleWindow.hide();
      }
      return;
    }

    const config = loadDesktopConfig();
    if (config.showCapsule === false) {
      if (capsuleWindow.isVisible()) {
        capsuleWindow.hide();
      }
      return;
    }

    // 2. 如果当前聚焦的是本软件自己的任意窗口（设置中心、微圆标自身、HUD），不自追踪
    if (isForegroundLingualWindow()) {
      return;
    }

    // 3. 并发锁，防止异步探针堆积排队
    if (isProbingFocus) return;
    isProbingFocus = true;

    try {
      const pos = await calculatePebblePositionAsync(CAPSULE_WIDTH, CAPSULE_HEIGHT);
      if (pos) {
        if (Math.abs(pos.x - lastPebblePos.x) > 6 || Math.abs(pos.y - lastPebblePos.y) > 6) {
          capsuleWindow.setPosition(pos.x, pos.y);
          lastPebblePos = pos;
        }
        if (!capsuleWindow.isVisible()) {
          capsuleWindow.showInactive();
          capsuleWindow.webContents.send("lingual:mode-changed", currentMode);
        }
      } else {
        if (capsuleWindow.isVisible()) {
          capsuleWindow.hide();
        }
      }
    } catch {
      // 容错防崩
    } finally {
      isProbingFocus = false;
    }
  }, 400);
}

/**
 * 2. In-Situ Roof-Docked Translation Card Window (输入框正上方 3 秒卡片)
 * Pops up directly above the active text box when Enter is pressed; auto-dismisses after 3s.
 */
function createHudWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: HUD_WIDTH,
    height: 180,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    resizable: false,
    focusable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const hudHtml = path.join(__dirname, "../../src/renderer/index.html");
  win.loadFile(hudHtml);

  win.on("blur", () => {
    if (viewState === "hud" || viewState === "spotlight") {
      switchToIdleView();
      restoreFocus(activeTargetHwnd);
    }
  });

  return win;
}

function switchToIdleView(): void {
  if (!hudWindow) return;
  viewState = "idle";
  hudWindow.setFocusable(false);
  hudWindow.hide();
  hudWindow.webContents.send("lingual:view-state", "idle");
}

/**
 * Deterministic In-Situ Roof-Docking directly above the active text input box:
 * 1. Probes UIA focused element rectangle (pixel-perfect bounding box of input/textarea).
 * 2. Clamps horizontally against screen right-edge boundary (never overflows right edge).
 * 3. Docks directly above the input box (roof-docking, 8px gap). If too close to screen top, flips below.
 * 4. Fallback chain: caret position -> cursor position -> primary display center.
 */
function calculateRoofDockingPosition(winWidth: number, winHeight: number): { x: number; y: number } {
  const focusedRect = getFocusedElementRect();
  const caret = getCaretPosition();
  const cursor = screen.getCursorScreenPoint();

  let targetX = 0;
  let targetY = 0;
  let targetH = 24;

  if (focusedRect && focusedRect.width > 0 && focusedRect.height > 0 && focusedRect.height < 160) {
    targetX = focusedRect.x;
    targetY = focusedRect.y;
    targetH = focusedRect.height;
  } else if (caret) {
    targetX = caret.x;
    targetY = caret.y;
    targetH = 20;
  } else {
    targetX = cursor.x;
    targetY = cursor.y;
    targetH = 20;
  }

  const display = screen.getDisplayNearestPoint({ x: targetX, y: targetY });
  const scale = display.scaleFactor || 1.0;
  const dipX = targetX / scale;
  const dipY = targetY / scale;
  const dipH = targetH / scale;
  const { workArea } = display;

  // 1. Horizontal Alignment & Right-Edge Screen Boundary Clamping
  let x = dipX;
  if (x + winWidth > workArea.x + workArea.width - 12) {
    x = workArea.x + workArea.width - winWidth - 12;
  }
  if (x < workArea.x + 12) {
    x = workArea.x + 12;
  }

  // 2. Vertical Roof-Docking (Directly above the input box)
  let y = dipY - winHeight - 8;
  if (y < workArea.y + 12) {
    // If too close to screen top, flip directly below the input box
    y = dipY + dipH + 8;
  }
  if (y + winHeight > workArea.y + workArea.height - 12) {
    y = workArea.y + workArea.height - winHeight - 12;
  }

  return { x: Math.round(x), y: Math.round(y) };
}

let lastAnchorPos = { x: 0, y: 0 };

function switchToHudView(autoSent = true): void {
  if (!hudWindow) return;
  viewState = "hud";

  if (autoSent) {
    hudWindow.setFocusable(false);
  } else {
    hudWindow.setFocusable(true);
  }

  const initialHeight = 180;
  hudWindow.setSize(HUD_WIDTH, initialHeight);

  const pos = calculateRoofDockingPosition(HUD_WIDTH, initialHeight);
  lastAnchorPos = pos;
  hudWindow.setPosition(pos.x, pos.y);

  if (autoSent) {
    hudWindow.showInactive();
  } else {
    hudWindow.show();
    hudWindow.focus();
  }
  hudWindow.webContents.send("lingual:view-state", "hud");
}

function switchToSpotlightView(): void {
  if (!hudWindow) return;
  viewState = "spotlight";
  hudWindow.setFocusable(true);
  hudWindow.setSize(HUD_WIDTH, HUD_HEIGHT);

  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const x = Math.round(display.workArea.x + (display.workArea.width - HUD_WIDTH) / 2);
  const y = Math.round(display.workArea.y + display.workArea.height * 0.25);

  hudWindow.setPosition(x, y);
  hudWindow.show();
  hudWindow.focus();
  hudWindow.webContents.send("lingual:view-state", "spotlight");
}

function cycleCompanionMode(): void {
  const modes: CompanionMode[] = ["english", "original", "off"];
  const nextIdx = (modes.indexOf(currentMode) + 1) % modes.length;
  currentMode = modes[nextIdx];
  saveDesktopConfig({ mode: currentMode });
  registerShortcuts(loadDesktopConfig());

  if (capsuleWindow && !capsuleWindow.isDestroyed()) {
    capsuleWindow.webContents.send("lingual:mode-changed", currentMode);
    if (currentMode === "off") {
      capsuleWindow.hide();
    }
  }
  updateTrayMenu();
  if (tray) {
    const title =
      currentMode === "english"
        ? "Translate Mode"
        : currentMode === "original"
        ? "Learn Mode"
        : "Off";
    const desc =
      currentMode === "english"
        ? "Press Enter to translate & replace in-place"
        : currentMode === "original"
        ? "Press Enter to submit original + pop up card"
        : "Companion paused";
    tray.displayBalloon({ title, content: desc });
  }
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

  // 触发翻译时，先隐去光标微圆标，避免与 3 秒大卡片重叠
  if (capsuleWindow && !capsuleWindow.isDestroyed() && capsuleWindow.isVisible()) {
    capsuleWindow.hide();
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
    switchToHudView(true);
    if (hudWindow && !hudWindow.isDestroyed()) {
      hudWindow.webContents.send("lingual:data", {
        loading: true,
        sourceText: captured.text,
        autoSent: true,
        modeLabel: "Learn",
      });
    }

    executeTranslation(captured.text, effectiveConfig, undefined, configuredSlots)
      .then((res) => {
        currentTranslationResponse = res;
        if (hudWindow && !hudWindow.isDestroyed() && hudWindow.isVisible()) {
          hudWindow.webContents.send("lingual:data", {
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
  switchToHudView(true);
  if (hudWindow && !hudWindow.isDestroyed()) {
    hudWindow.webContents.send("lingual:data", {
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
      if (hudWindow && !hudWindow.isDestroyed() && hudWindow.isVisible()) {
        hudWindow.webContents.send("lingual:data", {
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

    if (hudWindow && !hudWindow.isDestroyed() && hudWindow.isVisible()) {
      hudWindow.webContents.send("lingual:data", {
        ...res,
        sourceText: captured.text,
        autoSent: true,
        modeLabel: "Submitted",
        slots: res.slots,
      });
    }
  } catch (err: any) {
    console.error("[main] Translation interception error:", err);
    switchToIdleView();
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
        if (capsuleWindow && !capsuleWindow.isDestroyed()) {
          capsuleWindow.webContents.send("lingual:mode-changed", "english");
        }
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
        if (capsuleWindow && !capsuleWindow.isDestroyed()) {
          capsuleWindow.webContents.send("lingual:mode-changed", "original");
        }
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
        if (capsuleWindow && !capsuleWindow.isDestroyed()) {
          capsuleWindow.webContents.send("lingual:mode-changed", "off");
        }
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
    if (viewState !== "hud" || !hudWindow) return;
    const clampedHeight = Math.max(140, Math.min(340, Math.ceil(measuredHeight)));
    hudWindow.setSize(HUD_WIDTH, clampedHeight);

    const pos = calculateRoofDockingPosition(HUD_WIDTH, clampedHeight);
    hudWindow.setPosition(pos.x, pos.y);
  });

  ipcMain.on("lingual:toggle-mode", () => {
    cycleCompanionMode();
    if (activeTargetHwnd && activeTargetHwnd !== "0") {
      restoreFocus(activeTargetHwnd);
    }
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

    switchToIdleView();

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
    if (capsuleWindow && !capsuleWindow.isDestroyed()) {
      capsuleWindow.webContents.send("lingual:mode-changed", currentMode);
      if (updated.showCapsule === false || currentMode === "off") {
        capsuleWindow.hide();
      }
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
    switchToIdleView();
    restoreFocus(activeTargetHwnd);
  });

  ipcMain.on("lingual:dismiss", () => {
    switchToIdleView();
    restoreFocus(activeTargetHwnd);
  });

  ipcMain.on("lingual:drag-move", (_event, { dx, dy }) => {
    if (!capsuleWindow || capsuleWindow.isDestroyed()) return;
    const [x, y] = capsuleWindow.getPosition();
    const nextX = Math.round(x + dx);
    const nextY = Math.round(y + dy);
    capsuleWindow.setPosition(nextX, nextY);
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
      if (hudWindow && !hudWindow.isDestroyed() && hudWindow.isVisible()) {
        hudWindow.webContents.send("lingual:data", {
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

    capsuleWindow = createCapsuleWindow();
    hudWindow = createHudWindow();
    registerShortcuts(config);
    setupTray();
    setupIpc();
    startInputTracker();

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
    if (inputTrackerInterval) clearInterval(inputTrackerInterval);
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", () => {
    // Keep ambient companion resident in Windows system tray
  });
}
