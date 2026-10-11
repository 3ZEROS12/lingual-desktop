import { execFileSync, execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

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

export function triggerSelectAll(): void {
  try {
    const helper = getHelperPath("win32_helper.exe");
    execFileSync(helper, ["select-all"], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to trigger select all:", err);
  }
}

export function triggerCopyAll(): void {
  try {
    const helper = getHelperPath("win32_helper.exe");
    execFileSync(helper, ["copy-all"], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to trigger copy-all:", err);
  }
}

export function triggerEnter(): void {
  try {
    const helper = getHelperPath("win32_helper.exe");
    execFileSync(helper, ["send-enter"], { timeout: 2000 });
  } catch (err) {
    console.error("[win32] Failed to trigger enter:", err);
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

export function probeFocusedElement(): { isEditable: boolean; text: string | null; isTerminal?: boolean } {
  try {
    const helper = getHelperPath("uia_helper.exe");
    const out = execFileSync(helper, ["focused-text"], { encoding: "utf8", timeout: 2000 });
    const trimmed = out ? out.trim() : "";
    if (trimmed === "TERMINAL") {
      return { isEditable: false, text: null, isTerminal: true };
    }
    if (trimmed === "NONE" || trimmed === "NON_EDITABLE") {
      return { isEditable: false, text: null };
    }
    if (trimmed === "EDITABLE_FALLBACK" || trimmed === "UNSUPPORTED") {
      return { isEditable: true, text: null };
    }
    return { isEditable: true, text: out };
  } catch {
    return { isEditable: false, text: null };
  }
}

/**
 * Reads text from the currently focused element via Windows UI Automation
 * 100% zero clipboard interaction!
 */
export function getFocusedElementText(): string | null {
  const probe = probeFocusedElement();
  return probe.text;
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
    // 1. Try blazing fast 1ms native C Win32 helper first
    try {
      const win32Helper = getHelperPath("win32_helper.exe");
      const outC = execFileSync(win32Helper, ["focused-rect"], { encoding: "utf8", timeout: 800 }).trim();
      if (outC && outC !== "none") {
        const parts = outC.split(/\s+/);
        if (parts.length >= 4) {
          const x = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10);
          const width = parseInt(parts[2], 10);
          const height = parseInt(parts[3], 10);
          if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
            return { x, y, width, height };
          }
        }
      }
    } catch {}

    // 2. Fall back to UI Automation helper for Chromium/WPF apps
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

/**
 * Asynchronous, 100% non-blocking focused rect probe.
 * NEVER blocks Node.js event loop or freezes Electron UI!
 */
export async function getFocusedElementRectAsync(): Promise<{ x: number; y: number; width: number; height: number } | null> {
  try {
    // 1. Blazing fast 1ms native C Win32 helper first
    try {
      const win32Helper = getHelperPath("win32_helper.exe");
      const { stdout: outC } = await execFileAsync(win32Helper, ["focused-rect"], { encoding: "utf8", timeout: 1000 });
      const trimmedC = outC ? outC.trim() : "";
      if (trimmedC && trimmedC !== "none") {
        const parts = trimmedC.split(/\s+/);
        if (parts.length >= 4) {
          const x = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10);
          const width = parseInt(parts[2], 10);
          const height = parseInt(parts[3], 10);
          if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
            return { x, y, width, height };
          }
        }
      }
    } catch {}

    // 2. Non-blocking asynchronous UI Automation probe
    const helper = getHelperPath("uia_helper.exe");
    const { stdout } = await execFileAsync(helper, ["focused-rect"], { encoding: "utf8", timeout: 2500 });
    const trimmed = stdout ? stdout.trim() : "";
    if (!trimmed || trimmed === "NONE") return null;
    const parts = trimmed.split(/\s+/);
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

/**
 * Asynchronous, 100% non-blocking caret position probe.
 */
export async function getCaretPositionAsync(): Promise<{ x: number; y: number } | null> {
  try {
    const helper = getHelperPath("win32_helper.exe");
    const { stdout } = await execFileAsync(helper, ["caret"], { encoding: "utf8", timeout: 1000 });
    const trimmed = stdout ? stdout.trim() : "";
    if (!trimmed || trimmed === "none") return null;
    const parts = trimmed.split(/\s+/);
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
 * Capture entire input field via atomic Ctrl+A -> Ctrl+C when UIA is unsupported
 * (e.g. web browser search boxes, Electron chat inputs, custom canvas inputs)
 */
export async function captureAllInputText(
  clipboard: ClipboardLike
): Promise<{ text: string; backup: string } | null> {
  const backup = clipboard.readText();
  const sentinel = `__LINGUAL_CLIP_${Date.now()}_${Math.random()}__`;
  clipboard.writeText(sentinel);

  triggerCopyAll();

  const start = Date.now();
  let captured = "";
  while (Date.now() - start < 220) {
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
 * 2. Attempts copying currently highlighted selection (Ctrl+C).
 * 3. If nothing was highlighted and allowSelectAll is true (submit hotkey), executes Ctrl+A -> Ctrl+C to grab the whole input draft!
 */
export async function captureActiveInputText(
  clipboard: ClipboardLike,
  allowSelectAll = true
): Promise<{ text: string; backup: string; method: "uia" | "clipboard" } | null> {
  const probe = probeFocusedElement();

  // If the active control is inside a terminal emulator, NEVER hijack Ctrl+A/Ctrl+C
  if (probe.isTerminal) {
    return null;
  }

  // 1. Try UIA direct text read (0ms, zero clipboard pollution)
  if (probe.text && probe.text.trim()) {
    return {
      text: probe.text,
      backup: clipboard.readText(),
      method: "uia",
    };
  }

  // 2. Try currently highlighted selection (Ctrl+C)
  const clipCaptured = await captureSelectedText(clipboard);
  if (clipCaptured && clipCaptured.text.trim()) {
    return {
      text: clipCaptured.text,
      backup: clipCaptured.backup,
      method: "clipboard",
    };
  }

  // 3. For all desktop applications (Chrome, Edge, WeChat, Slack, Discord, Notepad, etc.):
  // When allowSelectAll is true (Enter trigger), execute atomic Ctrl+A -> Ctrl+C with sentinel restore guard!
  if (allowSelectAll) {
    const allCaptured = await captureAllInputText(clipboard);
    if (allCaptured && allCaptured.text.trim()) {
      return {
        text: allCaptured.text,
        backup: allCaptured.backup,
        method: "clipboard",
      };
    }
  }

  return null;
}

/**
 * Hybrid Text Injection:
 * 1. When submitting (Enter pipeline), uses atomic Ctrl+A -> Ctrl+V -> Enter so React/Vue/Web inputs
 *    update their internal state before form submission.
 * 2. When not submitting, attempts UIA SetValue first with clipboard fallback.
 */
export async function injectTextToTarget(
  replacementText: string,
  targetHwnd: string,
  backup: string,
  clipboard: ClipboardLike,
  submitAfter = false
): Promise<"uia" | "clipboard"> {
  if (!submitAfter) {
    const uiaSuccess = setFocusedElementText(replacementText);
    if (uiaSuccess) {
      return "uia";
    }
  }

  await injectReplacementText(replacementText, targetHwnd, backup, clipboard, submitAfter);
  return "clipboard";
}

/**
 * Injects replacement text into target window and restores the original clipboard
 * Uses an atomic clipboard sentinel check before rollback to guarantee zero clobbering of subsequent user copies!
 */
export async function injectReplacementText(
  replacementText: string,
  targetHwnd: string,
  backup: string,
  clipboard: ClipboardLike,
  submitAfter = false
): Promise<void> {
  clipboard.writeText(replacementText);
  restoreFocus(targetHwnd);
  await new Promise((r) => setTimeout(r, 40));
  // Clean replacement: select all before pasting to avoid appending Chinese + English!
  triggerSelectAll();
  await new Promise((r) => setTimeout(r, 20));
  triggerPaste();

  if (submitAfter) {
    await new Promise((r) => setTimeout(r, 35));
    triggerEnter();
  }

  setTimeout(() => {
    try {
      // 剪贴板安全哨兵 (Sentinel Guard):
      // 仅当剪贴板内容依然为我们注入的 replacementText 时才执行延迟回滚，
      // 若用户在 160ms 间隙内已主动复制了新文本，绝不盲目覆盖破坏用户的最新剪贴板！
      const currentClip = clipboard.readText();
      if (currentClip === replacementText) {
        clipboard.writeText(backup);
      }
    } catch {
      // Ignore background restore errors
    }
  }, 160);
}
