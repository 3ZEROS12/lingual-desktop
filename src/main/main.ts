import { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen, clipboard } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDesktopConfig, type LingualDesktopConfig } from "./config.js";
import { getActiveWindowHwnd, restoreFocus, getCaretPosition, captureSelectedText, injectReplacementText } from "./win32.js";
import { executeTranslation } from "./engine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let hudWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let activeTargetHwnd = "0";
let activeBackupText = "";
let currentTranslationResponse: any = null;

const HUD_WIDTH = 540;
const HUD_HEIGHT = 280;

function createHudWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: HUD_WIDTH,
    height: HUD_HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    resizable: false,
    hasShadow: false, // Handled in CSS for clean borders
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererHtml = path.join(__dirname, "../../src/renderer/index.html");
  win.loadFile(rendererHtml);

  // If user clicks outside HUD, auto-dismiss
  win.on("blur", () => {
    if (win.isVisible()) {
      win.hide();
      restoreFocus(activeTargetHwnd);
    }
  });

  return win;
}

function showHudAt(targetX: number, targetY: number): void {
  if (!hudWindow) return;

  const currentDisplay = screen.getDisplayNearestPoint({ x: targetX, y: targetY });
  const { workArea } = currentDisplay;

  // Clamp within display workArea bounds so HUD is never off-screen
  let clampedX = Math.max(workArea.x + 8, Math.min(targetX, workArea.x + workArea.width - HUD_WIDTH - 8));
  let clampedY = Math.max(workArea.y + 8, Math.min(targetY, workArea.y + workArea.height - HUD_HEIGHT - 8));

  hudWindow.setPosition(Math.round(clampedX), Math.round(clampedY));
  hudWindow.show();
  hudWindow.focus();
}

async function handleInPlaceTrigger(): Promise<void> {
  const targetHwnd = getActiveWindowHwnd();
  activeTargetHwnd = targetHwnd;

  const captured = await captureSelectedText(clipboard);
  if (!captured || !captured.text.trim()) {
    // If no text was selected, fallback to opening spotlight capsule at cursor
    handleSpotlightTrigger();
    return;
  }

  activeBackupText = captured.backup;

  const caret = getCaretPosition();
  const cursor = screen.getCursorScreenPoint();
  const pos = caret || cursor;

  showHudAt(pos.x, pos.y + 16);

  if (hudWindow) {
    hudWindow.webContents.send("lingual:data", {
      loading: true,
      mode: "In-Situ",
      text: captured.text,
    });
  }

  try {
    const res = await executeTranslation(captured.text);
    currentTranslationResponse = res;
    if (hudWindow && hudWindow.isVisible()) {
      hudWindow.webContents.send("lingual:data", {
        ...res,
        sourceText: captured.text,
        mode: "In-Situ",
      });
    }
  } catch (err: any) {
    console.error("[main] Translation error:", err);
    if (hudWindow && hudWindow.isVisible()) {
      hudWindow.webContents.send("lingual:data", {
        spoken: captured.text,
        written: captured.text,
        sourceText: captured.text,
        mode: "In-Situ",
      });
    }
  }
}

function handleSpotlightTrigger(): void {
  const targetHwnd = getActiveWindowHwnd();
  activeTargetHwnd = targetHwnd;
  activeBackupText = clipboard.readText();

  const cursor = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursor);
  const x = Math.round(display.workArea.x + (display.workArea.width - HUD_WIDTH) / 2);
  const y = Math.round(display.workArea.y + display.workArea.height * 0.25);

  showHudAt(x, y);

  if (hudWindow) {
    hudWindow.webContents.send("lingual:spotlight-open");
  }
}

function registerShortcuts(config: LingualDesktopConfig): void {
  globalShortcut.unregisterAll();

  const rewriteKey = config.hotkeyRewrite || "Alt+E";
  const spotlightKey = config.hotkeySpotlight || "Alt+Space";

  const okRewrite = globalShortcut.register(rewriteKey, () => {
    handleInPlaceTrigger();
  });
  if (!okRewrite) {
    console.warn(`[main] Failed to register global shortcut: ${rewriteKey}`);
  }

  const okSpotlight = globalShortcut.register(spotlightKey, () => {
    handleSpotlightTrigger();
  });
  if (!okSpotlight) {
    console.warn(`[main] Failed to register global shortcut: ${spotlightKey}`);
  }
}

function setupTray(): void {
  // Use a simple 16x16 programmatic canvas / buffer icon or standard tray
  tray = new Tray(path.join(__dirname, "../../assets/tray-icon.png"));
  tray.setToolTip("lingual-desktop · Universal Dual-Register Companion");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "⇄ lingual-desktop",
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Trigger In-Situ Rewrite (Alt+E)",
      click: () => handleInPlaceTrigger(),
    },
    {
      label: "Trigger Spotlight Capsule (Alt+Space)",
      click: () => handleSpotlightTrigger(),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function setupIpc(): void {
  ipcMain.on("lingual:select", async (_event, slot: 1 | 2) => {
    if (!currentTranslationResponse) {
      if (hudWindow) hudWindow.hide();
      restoreFocus(activeTargetHwnd);
      return;
    }

    const selectedText = slot === 1
      ? currentTranslationResponse.spoken
      : currentTranslationResponse.written;

    if (hudWindow) hudWindow.hide();

    if (selectedText) {
      await injectReplacementText(selectedText, activeTargetHwnd, activeBackupText, clipboard);
    } else {
      restoreFocus(activeTargetHwnd);
    }
  });

  ipcMain.on("lingual:dismiss", () => {
    if (hudWindow) hudWindow.hide();
    restoreFocus(activeTargetHwnd);
  });

  ipcMain.on("lingual:submit-spotlight", async (_event, input: string) => {
    try {
      const res = await executeTranslation(input);
      currentTranslationResponse = res;
      if (hudWindow && hudWindow.isVisible()) {
        hudWindow.webContents.send("lingual:data", {
          ...res,
          sourceText: input,
          mode: "Spotlight",
        });
      }
    } catch (err: any) {
      console.error("[main] Spotlight translation error:", err);
    }
  });
}

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    hudWindow = createHudWindow();
    const config = loadDesktopConfig();
    registerShortcuts(config);
    setupTray();
    setupIpc();

    console.log("[lingual-desktop] Initialized successfully. Shortcuts: Alt+E, Alt+Space");
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", (e: Event) => {
    e.preventDefault(); // Keep background daemon running in tray
  });
}
