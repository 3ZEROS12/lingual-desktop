import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  loadDesktopConfig,
  saveDesktopConfig,
  getConfigPath,
  DEFAULT_DESKTOP_CONFIG,
} from "../src/main/config.js";

test("config: loadDesktopConfig returns valid configuration object with companion defaults", () => {
  const cfg = loadDesktopConfig();
  assert.ok(cfg);
  assert.equal(typeof cfg.endpoint, "string");
  assert.equal(typeof cfg.model, "string");
  assert.equal(cfg.mode, "english");
  assert.equal(cfg.slotPreset, "developer");
  assert.equal(cfg.autoSend, true);
  assert.equal(cfg.showCapsule, true);
  assert.equal(cfg.hotkeyToggleMode, "Alt+Q");
  assert.equal(cfg.hotkeySubmit, "Enter");
});

test("config: saveDesktopConfig writes mode and autoSend to user config and reloads cleanly", () => {
  const configPath = getConfigPath();
  const originalExists = fs.existsSync(configPath);
  const originalRaw = originalExists ? fs.readFileSync(configPath, "utf8") : null;

  try {
    saveDesktopConfig({
      mode: "original",
      slotPreset: "social",
      autoSend: false,
      hotkeyToggleMode: "Ctrl+Shift+L",
    });

    const updated = loadDesktopConfig();
    assert.equal(updated.mode, "original");
    assert.equal(updated.slotPreset, "social");
    assert.equal(updated.autoSend, false);
    assert.equal(updated.hotkeyToggleMode, "Ctrl+Shift+L");
  } finally {
    if (originalExists && originalRaw !== null) {
      fs.writeFileSync(configPath, originalRaw, "utf8");
    } else if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
});
