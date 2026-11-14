import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDefaultDesktopDirectSlots,
  getDefaultDesktopCandidateSlots,
  getDefaultDesktopModifySlots,
  normalizeDesktopLangTag,
  DEFAULT_DESKTOP_CONFIG,
} from "../src/main/config.js";
import { SUPPORTED_LANG_CODES } from "pi-lingual/core";

/**
 * Invariant 5: Universal English Baseline & Symmetric Polyglot Parity.
 * The desktop slot factories must never silently fall back to English labels for a
 * supported language — that used to happen for es / fr / de / ru before this suite existed.
 */

test("parity: normalizeDesktopLangTag canonicalizes regional variants without breaking scripts", () => {
  assert.equal(normalizeDesktopLangTag("zh-CN"), "zh");
  assert.equal(normalizeDesktopLangTag("zh_Hans"), "zh");
  assert.equal(normalizeDesktopLangTag("zh-TW"), "tw");
  assert.equal(normalizeDesktopLangTag("zh-Hant"), "tw");
  assert.equal(normalizeDesktopLangTag("zh-HK"), "tw");
  assert.equal(normalizeDesktopLangTag("EN-us"), "en");
  assert.equal(normalizeDesktopLangTag(""), "en");
  assert.equal(normalizeDesktopLangTag(undefined), "en");
  assert.equal(normalizeDesktopLangTag("ja"), "ja");
});

test("parity: Direct mode yields a single localized translation slot for all 9 languages", () => {
  const englishLabel = getDefaultDesktopDirectSlots("en")[0].label;
  for (const code of SUPPORTED_LANG_CODES) {
    const slots = getDefaultDesktopDirectSlots(code);
    assert.equal(slots.length, 1, `${code}: direct mode must expose exactly 1 slot`);
    assert.equal(slots[0].role, "translation");
    assert.equal(slots[0].enabled, true);
    assert.ok(slots[0].label.trim().length > 0, `${code}: direct label is empty`);
  }
  assert.notEqual(getDefaultDesktopDirectSlots("ja")[0].label, englishLabel);
  assert.notEqual(getDefaultDesktopDirectSlots("ru")[0].label, englishLabel);
});

test("parity: Candidates mode localizes Casual / Polite / Concise for all 9 languages", () => {
  const englishTones = getDefaultDesktopCandidateSlots("en")
    .filter((s) => s.role === "translation")
    .map((s) => s.label);

  for (const code of SUPPORTED_LANG_CODES) {
    const slots = getDefaultDesktopCandidateSlots(code);
    assert.equal(slots.filter((s) => s.role === "source").length, 1, `${code}: missing source slot`);

    const tones = slots.filter((s) => s.role === "translation");
    assert.equal(tones.length, 3, `${code}: candidates mode must expose 3 tone slots`);
    for (const tone of tones) {
      assert.ok(tone.label.trim().length > 0, `${code}: empty tone label`);
      assert.ok(tone.instruction && tone.instruction.length > 20, `${code}: tone ${tone.id} lacks an instruction`);
    }
    assert.equal(new Set(tones.map((s) => s.label)).size, 3, `${code}: tone labels must be distinct`);

    if (code !== "en") {
      const localized = tones.map((s) => s.label);
      assert.notDeepEqual(
        localized,
        englishTones,
        `${code}: tone labels silently fell back to English`
      );
    }
  }
});

test("parity: Modify mode localizes Fixed / Native / Takeaway and the explanation language", () => {
  for (const code of SUPPORTED_LANG_CODES) {
    const slots = getDefaultDesktopModifySlots(code, code);
    assert.equal(slots.length, 3, `${code}: modify mode must expose 3 slots`);
    for (const slot of slots) {
      assert.ok(slot.label.trim().length > 0, `${code}: empty modify label`);
    }

    const fixes = slots.find((s) => s.role === "vocab");
    assert.ok(fixes, `${code}: missing takeaway slot`);
    // The takeaway slot must ask for the explanation in the user's own cognitive language.
    assert.ok(
      /explain the intuition\/rule briefly/i.test(fixes!.instruction || ""),
      `${code}: takeaway slot lost the explanation directive`
    );
  }

  const spanish = getDefaultDesktopModifySlots("es", "es").find((s) => s.role === "vocab")!;
  assert.ok((spanish.instruction || "").includes("Español"));
  const russian = getDefaultDesktopModifySlots("ru", "ru").find((s) => s.role === "vocab")!;
  assert.ok((russian.instruction || "").includes("Русский"));
});

test("parity: unknown languages degrade safely to English labels instead of undefined", () => {
  for (const weird of ["xx", "", "tlh", "zh-XX-YY"]) {
    const slots = getDefaultDesktopCandidateSlots(weird);
    for (const slot of slots) {
      assert.equal(typeof slot.label, "string");
      assert.ok(slot.label.trim().length > 0);
      assert.ok(!/undefined/i.test(slot.label));
    }
  }
});

test("parity: Kill List is enabled by default so fresh installs get anti-AI-slop writing", () => {
  assert.equal(DEFAULT_DESKTOP_CONFIG.killListEnabled, true);
  assert.deepEqual(DEFAULT_DESKTOP_CONFIG.globalKillList, []);
});
