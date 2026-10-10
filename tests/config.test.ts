import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  loadDesktopConfig,
  saveDesktopConfig,
  getConfigPath,
  DEFAULT_DESKTOP_CONFIG,
} from "../src/main/config.js";

test("config: loadDesktopConfig returns valid configuration object", () => {
  const cfg = loadDesktopConfig();
  assert.ok(cfg);
  assert.equal(typeof cfg.endpoint, "string");
  assert.equal(typeof cfg.model, "string");
  assert.equal(typeof cfg.hotkeyRewrite, "string");
  assert.equal(typeof cfg.hotkeySpotlight, "string");
});

test("config: saveDesktopConfig writes to user config path and reloads cleanly", () => {
  const configPath = getConfigPath();
  const originalExists = fs.existsSync(configPath);
  const originalRaw = originalExists ? fs.readFileSync(configPath, "utf8") : null;

  try {
    saveDesktopConfig({
      model: "test-model-suite",
      hotkeyRewrite: "Alt+R",
    });

    const updated = loadDesktopConfig();
    assert.equal(updated.model, "test-model-suite");
    assert.equal(updated.hotkeyRewrite, "Alt+R");
  } finally {
    // Restore or cleanup test changes
    if (originalExists && originalRaw !== null) {
      fs.writeFileSync(configPath, originalRaw, "utf8");
    } else if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
});
