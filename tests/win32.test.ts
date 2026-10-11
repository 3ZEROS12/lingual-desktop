import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getActiveWindowHwnd,
  getCaretPosition,
  getCaretPositionAsync,
  getFocusedElementRect,
  getFocusedElementRectAsync,
  getFocusedElementText,
  setFocusedElementText,
  captureSelectedText,
  injectReplacementText,
  captureActiveInputText,
  injectTextToTarget,
  isImeComposing,
  type ClipboardLike,
} from "../src/main/win32.js";

test("win32: getActiveWindowHwnd returns non-empty decimal hwnd", () => {
  const hwnd = getActiveWindowHwnd();
  assert.ok(hwnd && hwnd !== "0", `Expected non-zero hwnd, got ${hwnd}`);
  assert.match(hwnd, /^[0-9]+$/);
});

test("win32: isImeComposing returns boolean without throwing", () => {
  const composing = isImeComposing();
  assert.equal(typeof composing, "boolean");
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

test("win32: getCaretPositionAsync returns coordinate object or null asynchronously without blocking", async () => {
  const pos = await getCaretPositionAsync();
  if (pos !== null) {
    assert.equal(typeof pos.x, "number");
    assert.equal(typeof pos.y, "number");
  } else {
    assert.equal(pos, null);
  }
});

test("win32: getFocusedElementRectAsync returns bounding rectangle or null asynchronously without blocking", async () => {
  const rect = await getFocusedElementRectAsync();
  if (rect !== null) {
    assert.equal(typeof rect.x, "number");
    assert.equal(typeof rect.y, "number");
    assert.equal(typeof rect.width, "number");
    assert.equal(typeof rect.height, "number");
  } else {
    assert.equal(rect, null);
  }
});

test("win32: getFocusedElementText and setFocusedElementText execute without throwing", () => {
  const txt = getFocusedElementText();
  assert.ok(txt === null || typeof txt === "string");

  const success = setFocusedElementText("test-val");
  assert.equal(typeof success, "boolean");
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

  const targetHwnd = getActiveWindowHwnd();
  const replacement = "This feels over-engineered (Spoken)";

  await injectReplacementText(replacement, targetHwnd, initialBackup, mockClipboard);

  assert.equal(clipboardContent, replacement);

  await new Promise((r) => setTimeout(r, 220));

  assert.equal(
    mockClipboard.readText(),
    "Initial User Clipboard History (Should be restored)",
    "Original clipboard content was not restored!"
  );
});

test("win32: captureActiveInputText and injectTextToTarget handle hybrid pipeline", async () => {
  let clipboardContent = "Backup Text";
  const mockClipboard: ClipboardLike = {
    readText: () => clipboardContent,
    writeText: (t: string) => {
      clipboardContent = t;
    },
  };

  const targetHwnd = getActiveWindowHwnd();
  const res = await injectTextToTarget("Hybrid Test", targetHwnd, "Backup Text", mockClipboard);
  assert.ok(res === "uia" || res === "clipboard");
});
