import { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen, clipboard, powerMonitor } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadDesktopConfig,
  saveDesktopConfig,
  sanitizeAccelerator,
  type LingualDesktopConfig,
  type CompanionMode,
} from "./config.js";
import {
  getActiveWindowHwnd,
  restoreFocus,
  getFocusedElementText,
  injectTextToTarget,
  setFocusedElementText,
  startPassiveInputWatcher,
  stopPassiveInputWatcher,
  getLatestPassiveDraft,
  isDesktopNoiseInput,
  type PassiveSubmitEvent,
} from "./win32.js";
import {
  executeTranslation,
  shouldTriggerTranslation,
  generateSlotsFromUserIntent,
  detectLocalEndpoints,
} from "./engine.js";
import { getDefaultSlots } from "pi-lingual/core";
import { initLogger, logger, openLogFile, readRecentLogs } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let capsuleWindow: BrowserWindow | null = null;
let hudWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

let currentMode: CompanionMode = "original";
let activeTargetHwnd = "0";
let activeBackupText = "";
let currentTranslationResponse: any = null;
let viewState: "idle" | "hud" | "spotlight" = "idle";

const CAPSULE_WIDTH = 144;
const CAPSULE_HEIGHT = 30;
const HUD_WIDTH = 540;
const HUD_HEIGHT = 280;

let currentCapsulePos = { x: 0, y: 0 };

function notifyCapsuleModeChanged(mode: CompanionMode = currentMode): void {
  const config = loadDesktopConfig();
  const payload = {
    mode,
    targetLang: config.targetLang || "en",
  };
  if (capsuleWindow && !capsuleWindow.isDestroyed()) {
    capsuleWindow.webContents.send("lingual:mode-changed", payload);
  }
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send("lingual:mode-changed", payload);
  }
}

function clampCapsuleToScreen(x: number, y: number): { x: number; y: number } {
  try {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      const primary = screen.getPrimaryDisplay().workArea;
      return {
        x: Math.round(primary.x + (primary.width - CAPSULE_WIDTH) / 2),
        y: Math.round(primary.y + 10),
      };
    }
    const { workArea } = screen.getDisplayNearestPoint({ x: Math.round(x), y: Math.round(y) });
    return {
      x: Math.max(workArea.x, Math.min(Math.round(x), workArea.x + workArea.width - CAPSULE_WIDTH)),
      y: Math.max(workArea.y, Math.min(Math.round(y), workArea.y + workArea.height - CAPSULE_HEIGHT)),
    };
  } catch {
    return { x: 500, y: 10 };
  }
}

function getInitialCapsulePos(config: LingualDesktopConfig): { x: number; y: number } {
  if (config.capsulePos && typeof config.capsulePos.x === "number" && typeof config.capsulePos.y === "number") {
    return clampCapsuleToScreen(config.capsulePos.x, config.capsulePos.y);
  }
  try {
    const primary = screen.getPrimaryDisplay();
    // 默认居中常驻在屏幕最顶部（灵动岛极简胶囊，稳固不跳动，可随意拖拽）
    return {
      x: Math.round(primary.workArea.x + (primary.workArea.width - CAPSULE_WIDTH) / 2),
      y: Math.round(primary.workArea.y + 10),
    };
  } catch {
    return { x: 500, y: 10 };
  }
}

/**
 * 屏幕最顶部常驻极简悬浮小岛 (Resident Top Floating Island)
 * - 常驻在屏幕最上方，100% 稳固，绝不忽上忽下，绝不意外消失；
 * - 随时左键点击 [⇄ EN] 快速轮转模式 (EN / LEARN / OFF)；
 * - 随时点击 [⚙] 或右键呼出设置控制中心；
 * - 鼠标按住胶囊可自由平滑拖拽至屏幕任意边缘，松手即自动记忆位置；
 * - 打字敲回车时，就地在输入框正上方展开 3 秒双语对照卡片。
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
    show: false,
    resizable: false,
    focusable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const capsuleHtml = path.join(__dirname, "../../src/renderer/capsule.html");
  win.loadFile(capsuleHtml);

  win.webContents.on("console-message", (_event, level, message) => {
    logger.info("renderer:capsule", message);
  });

  win.once("ready-to-show", () => {
    if (config.showCapsule !== false) {
      win.showInactive();
      notifyCapsuleModeChanged(currentMode);
    }
  });

  return win;
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
    focusable: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const hudHtml = path.join(__dirname, "../../src/renderer/index.html");
  win.loadFile(hudHtml);

  win.webContents.on("console-message", (_event, level, message) => {
    logger.info("renderer:hud", message);
  });

  win.on("blur", () => {
    if (viewState === "spotlight" || (viewState === "hud" && currentMode === "select")) {
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
 * Dynamic Island In-Situ Expansion (灵动岛原位展开):
 * Always expands directly beneath (or above, if near screen bottom) the Top Floating Island (`capsuleWindow`).
 * 100% predictable position, zero eye-hunting across the screen, and never covers bottom chat input history!
 */
function calculateRoofDockingPosition(
  winWidth: number,
  winHeight: number,
  _overrideRect?: { x: number; y: number; width: number; height: number } | null
): { x: number; y: number } {
  let capX = currentCapsulePos.x;
  let capY = currentCapsulePos.y;
  if (capsuleWindow && !capsuleWindow.isDestroyed()) {
    try {
      const [cx, cy] = capsuleWindow.getPosition();
      capX = cx;
      capY = cy;
    } catch {}
  }

  const display = screen.getDisplayNearestPoint({ x: capX, y: capY });
  const { workArea } = display;

  // 1. Center horizontally beneath the Top Floating Island, clamped cleanly within screen workArea
  let x = capX + Math.round((CAPSULE_WIDTH - winWidth) / 2);
  if (x + winWidth > workArea.x + workArea.width - 12) {
    x = workArea.x + workArea.width - winWidth - 12;
  }
  if (x < workArea.x + 12) {
    x = workArea.x + 12;
  }

  // 2. Expand 6px directly below the Top Floating Island (or flip 6px above if island is near screen bottom)
  let y = capY + CAPSULE_HEIGHT + 6;
  if (y + winHeight > workArea.y + workArea.height - 12) {
    y = Math.max(workArea.y + 12, capY - winHeight - 6);
  }

  return { x: Math.round(x), y: Math.round(y) };
}

let lastAnchorPos = { x: 0, y: 0 };
let lastPassiveRect: { x: number; y: number; width: number; height: number } | null = null;

function switchToHudView(autoSent = true, overrideRect?: { x: number; y: number; width: number; height: number } | null): void {
  if (!hudWindow) return;
  viewState = "hud";
  hudWindow.setFocusable(true);

  const initialHeight = 180;
  hudWindow.setSize(HUD_WIDTH, initialHeight);

  if (overrideRect && overrideRect.width > 0 && overrideRect.height > 0) {
    lastPassiveRect = overrideRect;
  }

  const pos = calculateRoofDockingPosition(HUD_WIDTH, initialHeight, lastPassiveRect);
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

let passiveWatcherActive = false;

function syncPassiveWatcherWithMode(mode: CompanionMode = currentMode): void {
  if (mode === "off") {
    if (passiveWatcherActive) {
      stopPassiveInputWatcher();
      passiveWatcherActive = false;
    }
    switchToIdleView();
  } else {
    if (!passiveWatcherActive) {
      startPassiveInputWatcher(handlePassiveSubmit);
      passiveWatcherActive = true;
    }
  }
}

function cycleCompanionMode(): void {
  const modes: CompanionMode[] = ["original", "english", "select", "modify", "off"];
  const idx = modes.indexOf(currentMode);
  const nextIdx = (idx === -1 ? 0 : idx + 1) % modes.length;
  currentMode = modes[nextIdx];
  saveDesktopConfig({ mode: currentMode });
  registerShortcuts(loadDesktopConfig());
  syncPassiveWatcherWithMode(currentMode);

  notifyCapsuleModeChanged(currentMode);
  updateTrayMenu();
  if (tray) {
    const title =
      currentMode === "original"
        ? "1 · Learn Mode"
        : currentMode === "english"
        ? "2 · Direct Mode"
        : currentMode === "select"
        ? "3 · Candidates Mode"
        : currentMode === "modify"
        ? "4 · Modify Mode"
        : "0 · Off";
    const desc =
      currentMode === "original"
        ? "Press Enter -> 0ms raw send + dual-register card"
        : currentMode === "english"
        ? "Fast 1-line direct translation & copy/replace"
        : currentMode === "select"
        ? "Pick from 3 tones (1 Casual / 2 Polite / 3 Concise)"
        : currentMode === "modify"
        ? "Surgical in-place fix + native sibling comparison"
        : "Companion paused · 0 CPU hooks";
    tray.displayBalloon({ title, content: desc });
  }
  console.log(`[lingual-desktop] Mode cycled to: ${currentMode}`);
}

let passiveSubmitSeq = 0;

async function runDesktopTranslationFlow(
  evt: PassiveSubmitEvent,
  options?: { preSendReplace?: boolean }
): Promise<void> {
  if (currentMode === "off" && !options?.preSendReplace) return;

  const text = (evt.text || "").trim();
  if (!text || isDesktopNoiseInput(text)) return;

  const config = loadDesktopConfig();
  const effectiveMode: CompanionMode =
    options?.preSendReplace && (currentMode === "original" || currentMode === "off")
      ? "english"
      : currentMode;

  activeTargetHwnd = evt.hwnd || getActiveWindowHwnd();
  activeBackupText = text;

  const hasJapaneseKana = /[\u3040-\u30ff]/.test(text);
  const hasCjk = /[\u4e00-\u9fff]/.test(text);
  const effectiveSourceLang =
    hasJapaneseKana && config.targetLang !== "ja"
      ? "ja"
      : hasCjk && config.sourceLang !== "ja" && config.targetLang !== "zh"
      ? "zh"
      : config.sourceLang || "zh";

  if (!hasCjk && !hasJapaneseKana && !shouldTriggerTranslation(text, effectiveSourceLang)) {
    return;
  }

  const mySeq = ++passiveSubmitSeq;
  logger.info(
    "passive-watcher",
    `Dispatch #${mySeq} (${text.length} chars, mode=${effectiveMode}, app=${evt.app || "unknown"}): "${text.slice(0, 40).replace(/\n/g, " ")}"`
  );

  const effectiveConfig = { ...config, sourceLang: effectiveSourceLang, mode: effectiveMode };
  const rect = evt.w > 0 && evt.h > 0 ? { x: evt.x, y: evt.y, width: evt.w, height: evt.h } : null;

  const shouldFocusHud = effectiveMode === "select";
  switchToHudView(!shouldFocusHud, rect);
  if (hudWindow && !hudWindow.isDestroyed()) {
    hudWindow.webContents.send("lingual:data", {
      loading: true,
      sourceText: text,
      sourceLang: effectiveConfig.sourceLang,
      targetLang: effectiveConfig.targetLang,
      autoSent: !shouldFocusHud,
      modeLabel:
        effectiveMode === "original"
          ? "Learn"
          : effectiveMode === "select"
          ? "Pick 1-3"
          : effectiveMode === "modify"
          ? "Modify ⚡"
          : "Direct ⚡",
    });
  }

  try {
    const res = await executeTranslation(text, effectiveConfig, undefined, undefined, {
      app: evt.app,
      title: evt.title,
      mode: effectiveMode,
    });
    if (mySeq !== passiveSubmitSeq) return;
    currentTranslationResponse = res;

    if (res.isOfflineOrFailed) {
      if (hudWindow && !hudWindow.isDestroyed() && hudWindow.isVisible()) {
        hudWindow.webContents.send("lingual:data", {
          isOffline: true,
          sourceText: text,
          sourceLang: effectiveConfig.sourceLang,
          targetLang: effectiveConfig.targetLang,
          spoken: text,
          written: text,
          autoSent: false,
          modeLabel: "Offline",
          appBadge: res.appBadge,
          slots: res.slots,
        });
      }
      return;
    }

    const fixedSlotContent = res.slots?.find((s: any) => s.id === "fixed")?.content;
    const firstSlotContent = res.slots?.find((s: any) => s.role !== "source" && s.role !== "vocab")?.content;
    const replacement = (effectiveMode === "modify" && fixedSlotContent)
      ? fixedSlotContent
      : firstSlotContent || res.written || res.spoken;
    const shouldReplaceMode = effectiveMode === "english" || effectiveMode === "modify" || options?.preSendReplace;
    if (shouldReplaceMode && replacement) {
      clipboard.writeText(replacement);
      if (activeTargetHwnd && activeTargetHwnd !== "0") {
        restoreFocus(activeTargetHwnd);
      }
      const currentFocusedText = getFocusedElementText();
      const shouldReplace = Boolean(options?.preSendReplace) || Boolean(currentFocusedText && currentFocusedText.trim().length > 0);
      if (shouldReplace) {
        const uiaReplaced = setFocusedElementText(replacement);
        if (!uiaReplaced && activeTargetHwnd && activeTargetHwnd !== "0") {
          await injectTextToTarget(replacement, activeTargetHwnd, "", clipboard);
        }
      }
    }

    const isSingleFallback = Boolean(res.isZeroKeyFallback);
    if (hudWindow && !hudWindow.isDestroyed() && hudWindow.isVisible()) {
      hudWindow.webContents.send("lingual:data", {
        ...res,
        sourceText: text,
        sourceLang: effectiveConfig.sourceLang,
        targetLang: effectiveConfig.targetLang,
        autoSent: effectiveMode !== "select" || isSingleFallback,
        modeLabel: isSingleFallback
          ? "Web Fallback ✓"
          : effectiveMode === "original"
          ? "Learn"
          : effectiveMode === "select"
          ? "Pick 1-3"
          : effectiveMode === "modify"
          ? "Fixed ✓"
          : "Copied ✓",
        appBadge: res.appBadge,
        slots: res.slots,
      });
    }
  } catch (err: any) {
    logger.error("passive-watcher", "Passive translation error:", err);
    switchToIdleView();
  }
}

async function handlePassiveSubmit(evt: PassiveSubmitEvent): Promise<void> {
  await runDesktopTranslationFlow(evt, { preSendReplace: false });
}

export interface ShortcutRegistrationReport {
  enabled: boolean;
  toggleMode: { shortcut: string; registered: boolean; error?: string };
  rewrite: { shortcut: string; registered: boolean; error?: string };
  spotlight: { shortcut: string; registered: boolean; error?: string };
}

let lastShortcutReport: ShortcutRegistrationReport = {
  enabled: false,
  toggleMode: { shortcut: "", registered: false },
  rewrite: { shortcut: "", registered: false },
  spotlight: { shortcut: "", registered: false },
};

/**
 * Compliant and Safe Global Shortcut Registration:
 * 1. Honors user master toggle (`enableGlobalShortcuts`).
 * 2. Never hijacks plain keys or Enter (Enter is 100% passive pass-through).
 * 3. Gracefully handles key conflicts (PowerToys/system) without crashing or blocking.
 * 4. Allows unbinding/disabling shortcuts by setting empty string or "None".
 */
export function registerShortcuts(config: LingualDesktopConfig): ShortcutRegistrationReport {
  try {
    globalShortcut.unregisterAll();
  } catch {}

  const report: ShortcutRegistrationReport = {
    enabled: config.enableGlobalShortcuts !== false,
    toggleMode: { shortcut: "", registered: false },
    rewrite: { shortcut: "", registered: false },
    spotlight: { shortcut: "", registered: false },
  };

  if (!report.enabled) {
    lastShortcutReport = report;
    logger.info("shortcuts", "Global shortcuts disabled by user configuration (0 keys registered)");
    return report;
  }

  // 1. Cycle companion mode (Learn / Direct / Candidates / Off)
  const toggleKey = sanitizeAccelerator(config.hotkeyToggleMode);
  if (toggleKey) {
    report.toggleMode.shortcut = toggleKey;
    try {
      const ok = globalShortcut.register(toggleKey, () => {
        cycleCompanionMode();
        if (activeTargetHwnd && activeTargetHwnd !== "0") {
          restoreFocus(activeTargetHwnd);
        }
      });
      report.toggleMode.registered = ok;
      if (!ok) {
        report.toggleMode.error = "Conflict: already in use by system or another tool";
        logger.warn("shortcuts", `Failed to register hotkeyToggleMode [${toggleKey}] - already occupied`);
      } else {
        logger.info("shortcuts", `Successfully registered hotkeyToggleMode: ${toggleKey}`);
      }
    } catch (err: any) {
      report.toggleMode.error = err.message || "Registration failed";
      logger.warn("shortcuts", `Error registering hotkeyToggleMode [${toggleKey}]:`, err);
    }
  }

  // 2. Pre-send in-place rewrite [⚡]
  const rewriteKey = sanitizeAccelerator(config.hotkeyRewrite);
  if (rewriteKey) {
    report.rewrite.shortcut = rewriteKey;
    try {
      const ok = globalShortcut.register(rewriteKey, async () => {
        const draft = getLatestPassiveDraft();
        if (draft && draft.text && draft.text.trim()) {
          if (draft.hwnd && draft.hwnd !== "0") {
            restoreFocus(draft.hwnd);
          }
          await runDesktopTranslationFlow(draft, { preSendReplace: true });
          return;
        }
        const clipText = (clipboard.readText() || "").trim();
        if (clipText && !isDesktopNoiseInput(clipText)) {
          await runDesktopTranslationFlow(
            {
              type: "submit",
              hwnd: activeTargetHwnd,
              x: 0,
              y: 0,
              w: 0,
              h: 0,
              text: clipText,
            },
            { preSendReplace: true }
          );
        } else {
          switchToSpotlightView();
        }
      });
      report.rewrite.registered = ok;
      if (!ok) {
        report.rewrite.error = "Conflict: already in use by system or another tool";
        logger.warn("shortcuts", `Failed to register hotkeyRewrite [${rewriteKey}] - already occupied`);
      } else {
        logger.info("shortcuts", `Successfully registered hotkeyRewrite: ${rewriteKey}`);
      }
    } catch (err: any) {
      report.rewrite.error = err.message || "Registration failed";
      logger.warn("shortcuts", `Error registering hotkeyRewrite [${rewriteKey}]:`, err);
    }
  }

  // 3. Spotlight Quick Translation Window
  const spotlightKey = sanitizeAccelerator(config.hotkeySpotlight);
  if (spotlightKey) {
    report.spotlight.shortcut = spotlightKey;
    try {
      const ok = globalShortcut.register(spotlightKey, () => {
        switchToSpotlightView();
      });
      report.spotlight.registered = ok;
      if (!ok) {
        report.spotlight.error = "Conflict: already in use by system or another tool";
        logger.warn("shortcuts", `Failed to register hotkeySpotlight [${spotlightKey}] - already occupied`);
      } else {
        logger.info("shortcuts", `Successfully registered hotkeySpotlight: ${spotlightKey}`);
      }
    } catch (err: any) {
      report.spotlight.error = err.message || "Registration failed";
      logger.warn("shortcuts", `Error registering hotkeySpotlight [${spotlightKey}]:`, err);
    }
  }

  lastShortcutReport = report;
  return report;
}

function openSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 640,
    height: 620,
    minWidth: 580,
    minHeight: 520,
    title: "Lingual Settings",
    center: true,
    resizable: true,
    minimizable: true,
    maximizable: false,
    autoHideMenuBar: true,
    show: false,
    backgroundColor: "#fbfaf8",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const settingsHtml = path.join(__dirname, "../../src/renderer/settings.html");
  settingsWindow.loadFile(settingsHtml);

  settingsWindow.webContents.on("console-message", (_event, level, message) => {
    logger.info("renderer:settings", message);
  });

  settingsWindow.once("ready-to-show", () => {
    settingsWindow?.show();
    settingsWindow?.focus();
  });

  settingsWindow.on("focus", () => {
    // Focus settings
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
  const modeDisplay =
    currentMode === "original"
      ? "1 · LEARN"
      : currentMode === "english"
      ? "2 · DIRECT"
      : currentMode === "select"
      ? "3 · CANDIDATES"
      : currentMode === "modify"
      ? "4 · MODIFY"
      : "0 · OFF";

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Lingual · Mode: [${modeDisplay}]`,
      enabled: false,
    },
    {
      label: "Cycle Mode",
      click: () => cycleCompanionMode(),
    },
    {
      label: "Settings...",
      click: () => openSettingsWindow(),
    },
    { type: "separator" },
    {
      label: "1 · Learn (0ms Send + Full Companion Card)",
      type: "radio",
      checked: currentMode === "original",
      click: () => {
        currentMode = "original";
        saveDesktopConfig({ mode: "original" });
        registerShortcuts(loadDesktopConfig());
        syncPassiveWatcherWithMode("original");
        notifyCapsuleModeChanged("original");
        updateTrayMenu();
      },
    },
    {
      label: "2 · Direct (Fast 1-Line Translate & Copy/Replace)",
      type: "radio",
      checked: currentMode === "english",
      click: () => {
        currentMode = "english";
        saveDesktopConfig({ mode: "english" });
        registerShortcuts(loadDesktopConfig());
        syncPassiveWatcherWithMode("english");
        notifyCapsuleModeChanged("english");
        updateTrayMenu();
      },
    },
    {
      label: "3 · Candidates (Pick 1-3: Casual / Polite / Concise)",
      type: "radio",
      checked: currentMode === "select",
      click: () => {
        currentMode = "select";
        saveDesktopConfig({ mode: "select" });
        registerShortcuts(loadDesktopConfig());
        syncPassiveWatcherWithMode("select");
        notifyCapsuleModeChanged("select");
        updateTrayMenu();
      },
    },
    {
      label: "4 · Modify (Surgical In-Place Fix + Native Sibling)",
      type: "radio",
      checked: currentMode === "modify",
      click: () => {
        currentMode = "modify";
        saveDesktopConfig({ mode: "modify" });
        registerShortcuts(loadDesktopConfig());
        syncPassiveWatcherWithMode("modify");
        notifyCapsuleModeChanged("modify");
        updateTrayMenu();
      },
    },
    {
      label: "0 · Off (0 CPU Hooks)",
      type: "radio",
      checked: currentMode === "off",
      click: () => {
        currentMode = "off";
        saveDesktopConfig({ mode: "off" });
        registerShortcuts(loadDesktopConfig());
        syncPassiveWatcherWithMode("off");
        notifyCapsuleModeChanged("off");
        updateTrayMenu();
      },
    },
    { type: "separator" },
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
      label: "View Runtime Logs (runtime.log)",
      click: () => openLogFile(),
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

    const pos = calculateRoofDockingPosition(HUD_WIDTH, clampedHeight, lastPassiveRect);
    hudWindow.setPosition(pos.x, pos.y);
  });

  ipcMain.on("lingual:toggle-mode", () => {
    cycleCompanionMode();
    if (activeTargetHwnd && activeTargetHwnd !== "0") {
      restoreFocus(activeTargetHwnd);
    }
  });

  ipcMain.on("lingual:trigger-rewrite", async () => {
    const draft = getLatestPassiveDraft();
    if (draft && draft.text && draft.text.trim()) {
      if (draft.hwnd && draft.hwnd !== "0") {
        restoreFocus(draft.hwnd);
      }
      await runDesktopTranslationFlow(draft, { preSendReplace: true });
      return;
    }
    const clipText = (clipboard.readText() || "").trim();
    if (clipText && !isDesktopNoiseInput(clipText)) {
      await runDesktopTranslationFlow(
        {
          type: "submit",
          hwnd: activeTargetHwnd,
          x: 0,
          y: 0,
          w: 0,
          h: 0,
          text: clipText,
        },
        { preSendReplace: true }
      );
    } else {
      switchToSpotlightView();
    }
  });

  ipcMain.on("lingual:copy-text", (_event, text: string) => {
    if (typeof text === "string" && text.trim()) {
      clipboard.writeText(text.trim());
    }
    if (activeTargetHwnd && activeTargetHwnd !== "0") {
      restoreFocus(activeTargetHwnd);
    }
  });

  ipcMain.on("lingual:select", async (_event, slot: number) => {
    if (!currentTranslationResponse) {
      switchToIdleView();
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

    if (selectedText) {
      clipboard.writeText(selectedText);
      if (activeTargetHwnd && activeTargetHwnd !== "0") {
        restoreFocus(activeTargetHwnd);
      }
      const currentFocusedText = getFocusedElementText();
      const shouldInject = currentMode === "select" || Boolean(currentFocusedText && currentFocusedText.trim().length > 0);
      if (shouldInject) {
        const uiaReplaced = setFocusedElementText(selectedText);
        if (!uiaReplaced && activeTargetHwnd && activeTargetHwnd !== "0") {
          await injectTextToTarget(selectedText, activeTargetHwnd, "", clipboard);
        }
      }
    }

    restoreFocus(activeTargetHwnd);
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
    syncPassiveWatcherWithMode(currentMode);
    updateTrayMenu();
    if (capsuleWindow && !capsuleWindow.isDestroyed()) {
      notifyCapsuleModeChanged(currentMode);
      if (updated.showCapsule === false) {
        capsuleWindow.hide();
      } else {
        capsuleWindow.showInactive();
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
    const clamped = clampCapsuleToScreen(x + dx, y + dy);
    capsuleWindow.setPosition(clamped.x, clamped.y);
    currentCapsulePos = clamped;

    // If HUD card is currently expanded, smoothly follow the Top Floating Island in real time!
    if (viewState === "hud" && hudWindow && !hudWindow.isDestroyed() && hudWindow.isVisible()) {
      const [hw, hh] = hudWindow.getSize();
      const hudPos = calculateRoofDockingPosition(hw, hh);
      hudWindow.setPosition(hudPos.x, hudPos.y);
    }
  });

  ipcMain.on("lingual:save-capsule-pos", () => {
    if (typeof currentCapsulePos.x === "number" && typeof currentCapsulePos.y === "number") {
      saveDesktopConfig({ capsulePos: currentCapsulePos });
    }
  });

  ipcMain.on("lingual:open-settings", () => {
    openSettingsWindow();
  });

  ipcMain.on("lingual:open-log-file", () => {
    openLogFile();
  });

  ipcMain.handle("lingual:get-recent-logs", async () => {
    return readRecentLogs(100);
  });

  ipcMain.handle("lingual:get-shortcuts-report", async () => {
    return lastShortcutReport;
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
        content: "Settings window activated.",
      });
    }
  });

  app.whenReady().then(() => {
    try {
      app.setAppUserModelId("dev.lingual.desktop");
    } catch {}

    initLogger();

    const config = loadDesktopConfig();
    currentMode = config.mode || "original";

    capsuleWindow = createCapsuleWindow();
    hudWindow = createHudWindow();
    registerShortcuts(config);
    setupTray();
    setupIpc();
    syncPassiveWatcherWithMode(currentMode);

    // Auto self-heal on system resume from sleep
    try {
      powerMonitor.on("resume", () => {
        logger.info("system", "System resumed from sleep. Auto-recovering passive input watcher & shortcuts...");
        syncPassiveWatcherWithMode(currentMode);
        registerShortcuts(loadDesktopConfig());
      });
    } catch {}

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
        content: `Mode: [${currentMode.toUpperCase()}]. Click top floating island to switch modes.`,
      });
    }

    console.log(`[lingual-desktop] Initialized ambient companion in [${currentMode}] mode.`);
  });

  app.on("will-quit", () => {
    stopPassiveInputWatcher();
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", () => {
    // Keep ambient companion resident in Windows system tray
  });
}
