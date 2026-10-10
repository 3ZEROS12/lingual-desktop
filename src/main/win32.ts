import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getHelperPath(): string {
  const candidates = [
    path.join(__dirname, "../../bin/win32_helper.exe"),
    path.join(__dirname, "../bin/win32_helper.exe"),
    path.join(process.cwd(), "bin/win32_helper.exe"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  throw new Error(`win32_helper.exe not found in candidates: ${candidates.join(", ")}`);
}

export function getActiveWindowHwnd(): string {
  try {
    const helper = getHelperPath();
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
    const helper = getHelperPath();
    execFileSync(helper, ["focus", hwnd], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to restore focus to hwnd:", hwnd, err);
  }
}

export function triggerCopy(): void {
  try {
    const helper = getHelperPath();
    execFileSync(helper, ["copy"], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to trigger copy:", err);
  }
}

export function triggerPaste(): void {
  try {
    const helper = getHelperPath();
    execFileSync(helper, ["paste"], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to trigger paste:", err);
  }
}

export function getCaretPosition(): { x: number; y: number } | null {
  try {
    const helper = getHelperPath();
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

export interface ClipboardLike {
  readText(): string;
  writeText(text: string): void;
}

/**
 * Capture selected text with Atomic Clipboard Guard
 * 1. Backs up current clipboard.
 * 2. Triggers Ctrl+C.
 * 3. Waits up to 150ms for clipboard to update with newly selected text.
 * 4. Returns selected text and the original backup.
 */
export async function captureSelectedText(
  clipboard: ClipboardLike
): Promise<{ text: string; backup: string } | null> {
  const backup = clipboard.readText();
  // Clear or set temporary sentinel to detect change
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

  // If nothing was selected or clipboard didn't update, revert immediately
  if (!captured || captured === sentinel) {
    clipboard.writeText(backup);
    return null;
  }

  return { text: captured, backup };
}

/**
 * Injects replacement text into target window and restores the original clipboard
 * 1. Writes replacement text to clipboard.
 * 2. Restores focus to target window.
 * 3. Triggers Ctrl+V.
 * 4. Delays 150ms to let target window process paste, then restores original clipboard backup.
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

  // Delayed clipboard restore to protect user's Win+V history
  setTimeout(() => {
    try {
      clipboard.writeText(backup);
    } catch {
      // Ignore background restore errors
    }
  }, 160);
}
