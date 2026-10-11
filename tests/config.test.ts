import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  loadDesktopConfig,
  saveDesktopConfig,
  getConfigPath,
  DEFAULT_DESKTOP_CONFIG,
} from "../src/main/config.js";
import {
  getLogFilePath,
  logger,
  readRecentLogs,
} from "../src/main/logger.js";

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

test("config: persists uiLang, engineProvider, and capsulePos cleanly across sessions", () => {
  const configPath = getConfigPath();
  const originalExists = fs.existsSync(configPath);
  const originalRaw = originalExists ? fs.readFileSync(configPath, "utf8") : null;

  try {
    saveDesktopConfig({
      uiLang: "ja",
      engineProvider: "free",
      capsulePos: { x: 500, y: 300 },
    });

    const updated = loadDesktopConfig();
    assert.equal(updated.uiLang, "ja");
    assert.equal(updated.engineProvider, "free");
    assert.deepEqual(updated.capsulePos, { x: 500, y: 300 });
    // In free engine mode, endpoint points to zero-key fallback
    assert.ok(updated.endpoint.includes("127.0.0.1:0/free"));
  } finally {
    if (originalExists && originalRaw !== null) {
      fs.writeFileSync(configPath, originalRaw, "utf8");
    } else if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
});

test("logger: writes structured runtime logs and reads recent lines in isolated test sandbox", () => {
  const logPath = getLogFilePath();
  assert.ok(logPath.endsWith("runtime.log"));

  logger.info("test-suite", "Verification log entry #1");
  logger.warn("test-suite", "Verification warning #2");
  logger.error("test-suite", new Error("Simulated diagnostic error"));

  assert.ok(fs.existsSync(logPath), "Expected runtime.log file to be created");
  const recent = readRecentLogs(20);
  assert.ok(recent.includes("Verification log entry #1"));
  assert.ok(recent.includes("Verification warning #2"));
  assert.ok(recent.includes("Simulated diagnostic error"));
});
