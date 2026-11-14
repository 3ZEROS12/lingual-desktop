import { test } from "node:test";
import assert from "node:assert/strict";
import {
  translateCore,
  buildSystemPrompt,
  compileKillListInstruction,
  DEFAULT_KILL_LIST,
  SUPPORTED_LANG_CODES,
  getDefaultSlots,
  shouldShieldBypass,
  parseLlmResponse,
  repairAndParseJsonObject,
  LingualLruCache,
  globalLingualCache,
} from "pi-lingual/core";

/**
 * Drift guard for the `pi-lingual/core` bridge.
 *
 * `node_modules/pi-lingual` is a symlink to the live pi-lingual repository, so upstream
 * commits land in the desktop app instantly. These tests fail loudly the moment the
 * upstream core surface or its behaviour contract changes underneath us, instead of
 * letting the desktop app break silently at runtime.
 */

test("contract: pi-lingual/core still exports every symbol the desktop bridge depends on", () => {
  const required = {
    translateCore,
    buildSystemPrompt,
    compileKillListInstruction,
    DEFAULT_KILL_LIST,
    SUPPORTED_LANG_CODES,
    getDefaultSlots,
    shouldShieldBypass,
    parseLlmResponse,
    repairAndParseJsonObject,
    LingualLruCache,
    globalLingualCache,
  };
  for (const [name, value] of Object.entries(required)) {
    assert.notEqual(value, undefined, `pi-lingual/core no longer exports \`${name}\``);
  }
  assert.equal(typeof translateCore, "function");
  assert.equal(typeof buildSystemPrompt, "function");
  assert.equal(typeof compileKillListInstruction, "function");
  assert.ok(Array.isArray(DEFAULT_KILL_LIST) && DEFAULT_KILL_LIST.length > 0);
  assert.ok(Array.isArray(SUPPORTED_LANG_CODES) && SUPPORTED_LANG_CODES.length === 9);
});

test("contract: translateCore keeps 0ms shield bypass for code and CLI commands", async () => {
  assert.equal(shouldShieldBypass("const a = 1;"), true);
  assert.equal(shouldShieldBypass("git checkout -b feature/x"), true);

  const res = await translateCore({ text: "const a = 1;", sourceLang: "zh", targetLang: "en" });
  assert.equal(res.shieldBypassed, true);
  assert.equal(res.spoken, "const a = 1;");
  assert.equal(res.written, "const a = 1;");
});

test("contract: translateCore returns an empty result for blank input instead of calling the model", async () => {
  let completerCalls = 0;
  const res = await translateCore(
    { text: "   ", sourceLang: "zh", targetLang: "en" },
    {
      completer: async () => {
        completerCalls += 1;
        return "unexpected";
      },
    }
  );
  assert.equal(completerCalls, 0);
  assert.equal(res.spoken, "");
  assert.equal(res.shieldBypassed, false);
});

test("contract: translateCore maps completer JSON into labeled slot results", async () => {
  const slots = [
    { id: "source", label: "原文", role: "source" as const, enabled: true },
    {
      id: "spoken",
      label: "Casual",
      role: "translation" as const,
      instruction: "Natural conversational phrasing.",
      showMeaning: true,
      enabled: true,
    },
  ];

  const res = await translateCore(
    { text: "这个功能明天能上线吗？", sourceLang: "zh", targetLang: "en", slots },
    {
      completer: async () =>
        JSON.stringify({
          source: "这个功能明天能上线吗？",
          spoken: "Can we ship this tomorrow?",
          spoken_meaning: "casual",
        }),
    }
  );

  assert.equal(res.shieldBypassed, false);
  assert.equal(res.spoken, "Can we ship this tomorrow?");
  assert.ok(Array.isArray(res.slots));
  const translated = res.slots!.find((s) => s.id === "spoken");
  assert.ok(translated);
  assert.equal(translated!.role, "translation");
  assert.equal(translated!.content, "Can we ship this tomorrow?");
  assert.equal(translated!.meaning, "casual");
});

test("contract: buildSystemPrompt embeds custom slot labels and instructions", () => {
  const prompt = buildSystemPrompt("zh", "en", false, undefined, "general", [
    { id: "source", label: "原文", role: "source", enabled: true },
    {
      id: "direct",
      label: "Directo",
      role: "translation",
      instruction: "One natural ready-to-send sentence.",
      enabled: true,
    },
  ]);
  assert.ok(prompt.includes("Directo"), "custom slot label must reach the system prompt");
  assert.ok(prompt.includes("One natural ready-to-send sentence."));
});

test("contract: Kill List directive carries default clichés plus user additions", () => {
  const base = compileKillListInstruction();
  assert.ok(base.includes("KILL LIST"));
  assert.ok(base.toLowerCase().includes("delve"));

  const withUserWords = compileKillListInstruction(undefined, ["frobnicate", " synergy "]);
  assert.ok(withUserWords.includes("frobnicate"));
  assert.ok(withUserWords.includes("synergy"));

  // Pinned upstream semantic: a supplied globalKillList REPLACES the golden default list.
  // The desktop bridge compensates by merging DEFAULT_KILL_LIST itself (see engine.ts).
  assert.ok(
    !withUserWords.toLowerCase().includes("delve"),
    "upstream now merges kill lists — the desktop bridge merge in engine.ts can be simplified"
  );
});

test("contract: all 9 supported languages resolve localized default slot labels", () => {
  const english = getDefaultSlots("en").map((s) => s.label);
  for (const code of SUPPORTED_LANG_CODES) {
    const slots = getDefaultSlots(code);
    assert.ok(slots.length >= 3, `${code}: expected at least 3 default slots`);
    for (const slot of slots) {
      assert.equal(typeof slot.label, "string");
      assert.ok(slot.label.trim().length > 0, `${code}: slot ${slot.id} has an empty label`);
      assert.ok(!/undefined|null/i.test(slot.label), `${code}: slot ${slot.id} label is malformed`);
    }
  }

  const japanese = getDefaultSlots("ja").map((s) => s.label);
  assert.notDeepEqual(japanese, english, "ja must not silently fall back to English labels");
});
