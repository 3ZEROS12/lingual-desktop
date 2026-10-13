import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  loadDesktopConfig,
  saveDesktopConfig,
  getConfigPath,
  normalizeDesktopMode,
  resolveInitialUiLang,
  getDefaultDesktopDirectSlots,
  getDefaultDesktopCandidateSlots,
  getDefaultDesktopModifySlots,
  sanitizeAccelerator,
  DEFAULT_DESKTOP_CONFIG,
} from "../src/main/config.js";
import { classifyDesktopAppContext, isDesktopNoiseInput } from "../src/main/win32.js";
import { hasMixedCodeSwitch } from "../src/main/engine.js";
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
  assert.equal(cfg.mode, "original");
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

test("qa: zero banned buzzwords and complete 10-language matrix in settings UI", () => {
  const settingsJs = fs.readFileSync("src/renderer/settings.js", "utf8");
  const settingsHtml = fs.readFileSync("src/renderer/settings.html", "utf8");

  for (const banned of ["豆包", "白嫖", "完了"]) {
    assert.ok(!settingsJs.includes(banned), `Found banned term '${banned}' in settings.js`);
    assert.ok(!settingsHtml.includes(banned), `Found banned term '${banned}' in settings.html`);
  }

  for (const lang of ["zh:", "en:", "ja:", "ko:", "es:", "fr:", "de:", "ru:"]) {
    assert.ok(settingsJs.includes(lang), `Missing UI_I18N dictionary for ${lang}`);
  }

  for (const code of ["zh", "en", "ja", "ko", "es", "fr", "de", "ru", "pt", "it"]) {
    assert.ok(settingsHtml.includes(`data-slang="${code}"`), `Missing source chip for ${code}`);
    assert.ok(settingsHtml.includes(`data-tlang="${code}"`), `Missing target chip for ${code}`);
  }
});

test("qa: zero globalShortcut Enter hijacking and dynamic language pebble/HUD wiring", () => {
  const mainTs = fs.readFileSync("src/main/main.ts", "utf8");
  assert.ok(!mainTs.includes('globalShortcut.register("Enter"'), "Enter key must not be hijacked via globalShortcut");

  const capsuleJs = fs.readFileSync("src/renderer/capsule.js", "utf8");
  assert.ok(capsuleJs.includes("currentTargetLang"), "Top floating island must dynamically reflect targetLang");

  const hudHtml = fs.readFileSync("src/renderer/index.html", "utf8");
  assert.ok(hudHtml.includes('id="hud-pair-text"'), "HUD HTML must expose #hud-pair-text");
});

test("v0.5.4 parity: mode normalization, sourceLang slot sovereignty, and 0-CPU off mode watcher lifecycle", () => {
  // 1. Mode normalization safely handles 4 isolated desktop modes (original / english / select / off)
  assert.equal(normalizeDesktopMode("companion"), "original");
  assert.equal(normalizeDesktopMode("1"), "original");
  assert.equal(normalizeDesktopMode("direct"), "english");
  assert.equal(normalizeDesktopMode("2"), "english");
  assert.equal(normalizeDesktopMode("candidates"), "select");
  assert.equal(normalizeDesktopMode("select"), "select");
  assert.equal(normalizeDesktopMode("3"), "select");
  assert.equal(normalizeDesktopMode("modify"), "modify");
  assert.equal(normalizeDesktopMode("4"), "modify");
  assert.equal(normalizeDesktopMode("off"), "off");
  assert.equal(normalizeDesktopMode("0"), "off");

  // 2. Multi-Mode isolated desktop slot defaults (Direct = 1 line; Candidates = 3 tones; Modify = 3 slots)
  assert.equal(getDefaultDesktopDirectSlots("zh").length, 1);
  assert.equal(getDefaultDesktopDirectSlots("zh")[0].showMeaning, false);
  const candSlots = getDefaultDesktopCandidateSlots("zh").filter((s) => s.role !== "source");
  assert.deepEqual(candSlots.map((s) => s.id), ["casual", "polite", "concise"]);
  const modSlots = getDefaultDesktopModifySlots("en");
  assert.equal(modSlots.length, 3);
  assert.deepEqual(modSlots.map((s) => s.id), ["fixed", "native", "fixes"]);

  // 3. App-Aware context sensing & desktop noise filter & code-switch detection
  assert.equal(classifyDesktopAppContext("slack", "general").category, "chat");
  assert.equal(classifyDesktopAppContext("outlook", "Inbox").category, "mail");
  assert.equal(classifyDesktopAppContext("chrome", "Pull Request #12 · GitHub").category, "code");
  assert.equal(classifyDesktopAppContext("chrome", "Home / X.com").category, "social");
  assert.equal(isDesktopNoiseInput("https://github.com/3ZEROS12/pi-lingual"), true);
  assert.equal(isDesktopNoiseInput("C:\\Users\\Jason\\file.txt"), true);
  assert.equal(isDesktopNoiseInput("好"), true);
  assert.equal(isDesktopNoiseInput("我们先把核心流程跑通"), false);
  assert.equal(hasMixedCodeSwitch("Let's hold off on this release until 我们把边界条件测完"), true);

  // 4. Native GUI HUD: zero terminal ASCII tree (┌ ├ └) in index.html, clickable vocab chips & hover auto-dismiss
  const hudHtml = fs.readFileSync("src/renderer/index.html", "utf8");
  assert.ok(!/[┌├└]/.test(hudHtml), "Desktop HUD HTML must not use terminal ASCII tree characters");
  const hudJs = fs.readFileSync("src/renderer/hud.js", "utf8");
  assert.ok(hudJs.includes("parseVocabIntoChips"), "hud.js must render clickable vocabulary chips");
  assert.ok(hudJs.includes("startAutoDismissTimer"), "hud.js must include hover-aware auto-dismiss timer");

  // 2. UI language resolution defaults to English baseline and mirrors sourceLang
  assert.equal(resolveInitialUiLang(undefined, "ja"), "ja");
  assert.equal(resolveInitialUiLang(undefined, "en"), "en");
  assert.equal(resolveInitialUiLang(undefined, "zh"), "zh");
  assert.equal(resolveInitialUiLang(undefined, undefined), "en");

  // 3. Default slots dynamically mirror sourceLang (Japanese user gets Japanese slot labels, not hardcoded English)
  const configPath = getConfigPath();
  const originalExists = fs.existsSync(configPath);
  const originalRaw = originalExists ? fs.readFileSync(configPath, "utf8") : null;
  try {
    saveDesktopConfig({ sourceLang: "ja", targetLang: "en", slots: undefined as any });
    const jaCfg = loadDesktopConfig();
    assert.deepEqual(
      jaCfg.slots.map((s) => s.label),
      ["原文", "口語", "文面", "単語"]
    );
  } finally {
    if (originalExists && originalRaw !== null) {
      fs.writeFileSync(configPath, originalRaw, "utf8");
    } else if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }

  // 4. Off mode physically stops passive watcher in main.ts and hud.js supports 0/Escape dismiss + 5-Persona QA locks
  const mainTs = fs.readFileSync("src/main/main.ts", "utf8");
  assert.ok(mainTs.includes("syncPassiveWatcherWithMode"), "main.ts must sync passive watcher lifecycle with mode");
  assert.ok(mainTs.includes("CAPSULE_WIDTH = 144"), "Capsule width must be >= 144px to prevent clipping PICK 3 + bolt + gear");
  assert.ok(mainTs.includes("focusable: false"), "Capsule window must use focusable: false so clicking [⚡] never steals IM focus");
  assert.ok(mainTs.includes("injectTextToTarget(replacement"), "main.ts must fall back to injectTextToTarget when UIA ValuePattern is unsupported");
  assert.ok(mainTs.includes("settingsWindow.webContents.send(\"lingual:mode-changed\""), "main.ts must sync mode changes to settingsWindow");
  assert.ok(hudJs.includes('e.key === "0" || e.key === "Escape"'), "hud.js must support 0 and Escape to dismiss");
  assert.ok(hudJs.includes("startAutoDismissTimer(900)"), "hud.js must auto-dismiss after candidate selection");

  const settingsJs = fs.readFileSync("src/renderer/settings.js", "utf8");
  const modeSelMatches = settingsJs.match(/mode_sel_title:/g) || [];
  assert.equal(modeSelMatches.length, 9, "All 9 languages in settings.js must define mode_sel_title");
  const modeModMatches = settingsJs.match(/mode_mod_title:/g) || [];
  assert.equal(modeModMatches.length, 9, "All 9 languages in settings.js must define mode_mod_title");
});

test("shortcuts: sanitizeAccelerator validates combinations and rejects dangerous bare keys", () => {
  // 1. Rejects dangerous single keys without modifiers
  assert.equal(sanitizeAccelerator("Enter"), "");
  assert.equal(sanitizeAccelerator("Return"), "");
  assert.equal(sanitizeAccelerator("Space"), "");
  assert.equal(sanitizeAccelerator("A"), "");
  assert.equal(sanitizeAccelerator("1"), "");
  assert.equal(sanitizeAccelerator("F1"), "");

  // 2. Rejects None, off, or empty (clean unbind)
  assert.equal(sanitizeAccelerator(""), "");
  assert.equal(sanitizeAccelerator("none"), "");
  assert.equal(sanitizeAccelerator("OFF"), "");

  // 3. Normalizes standard multi-key combinations
  assert.equal(sanitizeAccelerator("alt+q"), "Alt+Q");
  assert.equal(sanitizeAccelerator("Alt+Shift+E"), "Alt+Shift+E");
  assert.equal(sanitizeAccelerator("ctrl+shift+l"), "CommandOrControl+Shift+L");
  assert.equal(sanitizeAccelerator("Alt+Space"), "Alt+Space");

  // 4. Disallows combinations with Enter to avoid hijacking Enter globally
  assert.equal(sanitizeAccelerator("Ctrl+Enter"), "");
  assert.equal(sanitizeAccelerator("Alt+Return"), "");
});

test("shortcuts: persists custom hotkeys, unbinds cleanly, and supports master toggle", () => {
  const configPath = getConfigPath();
  const originalExists = fs.existsSync(configPath);
  const originalRaw = originalExists ? fs.readFileSync(configPath, "utf8") : null;

  try {
    // 1. Unbind hotkeyToggleMode (set to empty) and set custom hotkeySpotlight
    saveDesktopConfig({
      enableGlobalShortcuts: false,
      hotkeyToggleMode: "",
      hotkeyRewrite: "Alt+Shift+E",
      hotkeySpotlight: "Ctrl+Shift+L",
    });

    const cfg = loadDesktopConfig();
    assert.equal(cfg.enableGlobalShortcuts, false);
    assert.equal(cfg.hotkeyToggleMode, "");
    assert.equal(cfg.hotkeyRewrite, "Alt+Shift+E");
    assert.equal(cfg.hotkeySpotlight, "Ctrl+Shift+L");

    // 2. Re-enable and reset default
    saveDesktopConfig({
      enableGlobalShortcuts: true,
      hotkeyToggleMode: "Alt+Q",
    });

    const cfg2 = loadDesktopConfig();
    assert.equal(cfg2.enableGlobalShortcuts, true);
    assert.equal(cfg2.hotkeyToggleMode, "Alt+Q");
  } finally {
    if (originalExists && originalRaw !== null) {
      fs.writeFileSync(configPath, originalRaw, "utf8");
    } else if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
});

test("shortcuts: settings UI exposes hotkey configuration with complete 9-language i18n", () => {
  const settingsHtml = fs.readFileSync("src/renderer/settings.html", "utf8");
  assert.ok(settingsHtml.includes('id="check-enable-shortcuts"'), "Settings must have enable shortcuts toggle");
  assert.ok(settingsHtml.includes('id="input-hk-toggle"'), "Settings must have input for toggle mode");
  assert.ok(settingsHtml.includes('id="btn-clear-hk-toggle"'), "Settings must have clear button for toggle mode");
  assert.ok(settingsHtml.includes('id="btn-unbind-all-hk"'), "Settings must have unbind all button");

  const settingsJs = fs.readFileSync("src/renderer/settings.js", "utf8");
  const hkTitleMatches = settingsJs.match(/sec_hotkeys_title:/g) || [];
  assert.equal(hkTitleMatches.length, 9, "All 9 languages in settings.js must define sec_hotkeys_title");
  const unbindMatches = settingsJs.match(/btn_unbind_all_hk:/g) || [];
  assert.equal(unbindMatches.length, 9, "All 9 languages in settings.js must define btn_unbind_all_hk");
});



