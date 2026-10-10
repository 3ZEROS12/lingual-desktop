import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getActiveWindowHwnd,
  getCaretPosition,
  captureSelectedText,
  injectReplacementText,
  type ClipboardLike,
} from "../src/main/win32.js";

test("win32: getActiveWindowHwnd returns non-empty decimal hwnd", () => {
  const hwnd = getActiveWindowHwnd();
  assert.ok(hwnd && hwnd !== "0", `Expected non-zero hwnd, got ${hwnd}`);
  assert.match(hwnd, /^[0-9]+$/);
});

test("win32: getCaretPosition returns coordinate object or null gracefully", () => {
  const pos = getCaretPosition();
  if (pos !== null) {
    assert.equal(typeof pos.x, "number");
    assert.equal(typeof pos.y, "number");
  } else {
    assert.equal(pos, null);
  }
});

test("win32: captureSelectedText and injectReplacementText manage clipboard transaction", async () => {
  let clipboardContent = "Initial User Clipboard History (Should be restored)";

  const mockClipboard: ClipboardLike = {
    readText: () => clipboardContent,
    writeText: (txt: string) => {
      clipboardContent = txt;
    },
  };

  const initialBackup = mockClipboard.readText();
  assert.equal(initialBackup, "Initial User Clipboard History (Should be restored)");

  // Test injection with delayed rollback
  const targetHwnd = getActiveWindowHwnd();
  const replacement = "This feels over-engineered (Spoken)";

  await injectReplacementText(replacement, targetHwnd, initialBackup, mockClipboard);

  // Immediately after injection, clipboard holds replacement
  assert.equal(clipboardContent, replacement);

  // Wait for 220ms delayed rollback
  await new Promise((r) => setTimeout(r, 220));

  // User's clipboard must be restored 100% cleanly
  assert.equal(
    mockClipboard.readText(),
    "Initial User Clipboard History (Should be restored)",
    "Original clipboard content was not restored!"
  );
});
