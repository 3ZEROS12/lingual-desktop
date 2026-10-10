import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getHelperPath(helperName: "win32_helper.exe" | "uia_helper.exe" = "win32_helper.exe"): string {
  const candidates = [
    // 1. Packaged Electron production runtime path (asarUnpack)
    path.join(process.resourcesPath || "", "app.asar.unpacked/bin", helperName),
    // 2. Development & test runtime paths
    path.join(__dirname, "../../bin", helperName),
    path.join(__dirname, "../bin", helperName),
    path.join(process.cwd(), "bin", helperName),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  throw new Error(`${helperName} not found in candidates: ${candidates.join(", ")}`);
}

export function getActiveWindowHwnd(): string {
  try {
    const helper = getHelperPath("win32_helper.exe");
    const out = execFileSync(helper, ["active-window"], { encoding: "utf8", timeout: 2000 }).trim();
    return out;
  } catch (err) {
    console.error("[win32] Failed to get active window hwnd:", err);
    return "0";
  }
}

export function restoreFocus(hwnd: string): void {
  try {
    if (!hwnd || hwnd === "0") return;
    const helper = getHelperPath("win32_helper.exe");
    execFileSync(helper, ["focus", hwnd], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to restore focus to hwnd:", hwnd, err);
  }
}

export function triggerCopy(): void {
  try {
    const helper = getHelperPath("win32_helper.exe");
    execFileSync(helper, ["copy"], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to trigger copy:", err);
  }
}

export function triggerPaste(): void {
  try {
    const helper = getHelperPath("win32_helper.exe");
    execFileSync(helper, ["paste"], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to trigger paste:", err);
  }
}

/**
 * Checks if the foreground application's input method is currently composing text (e.g. typing pinyin)
 * If true, our companion MUST NOT intercept submission or touch input!
 */
export function isImeComposing(): boolean {
  try {
    const helper = getHelperPath("win32_helper.exe");
    const out = execFileSync(helper, ["ime-composing"], { encoding: "utf8", timeout: 1500 }).trim();
    return out === "1";
  } catch {
    return false;
  }
}

export function getCaretPosition(): { x: number; y: number } | null {
  try {
    const helper = getHelperPath("win32_helper.exe");
    const out = execFileSync(helper, ["caret"], { encoding: "utf8", timeout: 2000 }).trim();
    if (!out || out === "none") return null;
    const parts = out.split(/\s+/);
    if (parts.length >= 2) {
      const x = parseInt(parts[0], 10);
      const y = parseInt(parts[1], 10);
      if (!isNaN(x) && !isNaN(y)) {
        return { x, y };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Reads text from the currently focused element via Windows UI Automation
 * 100% zero clipboard interaction!
 */
export function getFocusedElementText(): string | null {
  try {
    const helper = getHelperPath("uia_helper.exe");
    const out = execFileSync(helper, ["focused-text"], { encoding: "utf8", timeout: 2000 });
    if (!out || out === "NONE" || out === "UNSUPPORTED") return null;
    return out;
  } catch {
    return null;
  }
}

/**
 * Sets text in the currently focused element via Windows UI Automation
 * 100% zero clipboard interaction!
 */
export function setFocusedElementText(text: string): boolean {
  try {
    const helper = getHelperPath("uia_helper.exe");
    const out = execFileSync(helper, ["set-text", text], { encoding: "utf8", timeout: 2000 }).trim();
    return out === "OK";
  } catch {
    return false;
  }
}

/**
 * Retrieves the bounding rectangle of the currently focused UI element
 */
export function getFocusedElementRect(): { x: number; y: number; width: number; height: number } | null {
  try {
    const helper = getHelperPath("uia_helper.exe");
    const out = execFileSync(helper, ["focused-rect"], { encoding: "utf8", timeout: 2000 }).trim();
    if (!out || out === "NONE") return null;
    const parts = out.split(/\s+/);
    if (parts.length >= 4) {
      const x = parseInt(parts[0], 10);
      const y = parseInt(parts[1], 10);
      const width = parseInt(parts[2], 10);
      const height = parseInt(parts[3], 10);
      if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
        return { x, y, width, height };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export interface ClipboardLike {
  readText(): string;
  writeText(text: string): void;
}

/**
 * Capture selected text with Atomic Clipboard Guard
 */
export async function captureSelectedText(
  clipboard: ClipboardLike
): Promise<{ text: string; backup: string } | null> {
  const backup = clipboard.readText();
  const sentinel = `__LINGUAL_CLIP_${Date.now()}_${Math.random()}__`;
  clipboard.writeText(sentinel);

  triggerCopy();

  const start = Date.now();
  let captured = "";
  while (Date.now() - start < 180) {
    await new Promise((r) => setTimeout(r, 20));
    const current = clipboard.readText();
    if (current && current !== sentinel) {
      captured = current;
      break;
    }
  }

  if (!captured || captured === sentinel) {
    clipboard.writeText(backup);
    return null;
  }

  return { text: captured, backup };
}

/**
 * Hybrid Text Capture:
 * 1. Attempts UI Automation first (0ms, 0 clipboard pollution).
 * 2. If UIA unsupported, smoothly falls back to Atomic Clipboard Guard.
 */
export async function captureActiveInputText(
  clipboard: ClipboardLike
): Promise<{ text: string; backup: string; method: "uia" | "clipboard" } | null> {
  const uiaText = getFocusedElementText();
  if (uiaText && uiaText.trim()) {
    return {
      text: uiaText,
      backup: clipboard.readText(),
      method: "uia",
    };
  }

  const clipCaptured = await captureSelectedText(clipboard);
  if (clipCaptured) {
    return {
      text: clipCaptured.text,
      backup: clipCaptured.backup,
      method: "clipboard",
    };
  }

  return null;
}

/**
 * Hybrid Text Injection:
 * 1. Attempts UI Automation SetValue first (0ms, 0 clipboard pollution).
 * 2. If UIA unsupported, restores focus and triggers delayed-rollback Clipboard Paste.
 */
export async function injectTextToTarget(
  replacementText: string,
  targetHwnd: string,
  backup: string,
  clipboard: ClipboardLike
): Promise<"uia" | "clipboard"> {
  const uiaSuccess = setFocusedElementText(replacementText);
  if (uiaSuccess) {
    return "uia";
  }

  // Fallback to clipboard transaction
  await injectReplacementText(replacementText, targetHwnd, backup, clipboard);
  return "clipboard";
}

/**
 * Injects replacement text into target window and restores the original clipboard
 */
export async function injectReplacementText(
  replacementText: string,
  targetHwnd: string,
  backup: string,
  clipboard: ClipboardLike
): Promise<void> {
  clipboard.writeText(replacementText);
  restoreFocus(targetHwnd);
  await new Promise((r) => setTimeout(r, 40));
  triggerPaste();

  setTimeout(() => {
    try {
      clipboard.writeText(backup);
    } catch {
      // Ignore background restore errors
    }
  }, 160);
}
