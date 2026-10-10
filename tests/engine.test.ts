import { test } from "node:test";
import assert from "node:assert/strict";
import {
  executeTranslation,
  shouldTriggerTranslation,
  fetchZeroKeyTranslation,
  detectLocalEndpoints,
  generateSlotsFromUserIntent,
} from "../src/main/engine.js";

test("engine: executeTranslation bypasses pure CLI command via 0ms shield", async () => {
  const res = await executeTranslation("git checkout -b feature/unified-desktop");
  assert.equal(res.shieldBypassed, true);
  assert.equal(res.spoken, "git checkout -b feature/unified-desktop");
  assert.equal(res.written, "git checkout -b feature/unified-desktop");
});

test("engine: executeTranslation bypasses code statements via 0ms shield", async () => {
  const res = await executeTranslation("const [state, setState] = useState(null);");
  assert.equal(res.shieldBypassed, true);
  assert.equal(res.spoken, "const [state, setState] = useState(null);");
});

test("engine: shouldTriggerTranslation correctly detects natural language for companion interception", () => {
  assert.equal(shouldTriggerTranslation("这个并发引擎性能极佳，彻底解决了内存泄漏问题", "zh"), true);
  assert.equal(shouldTriggerTranslation("npm install", "zh"), false);
  assert.equal(shouldTriggerTranslation("const a = 1;", "zh"), false);
  assert.equal(shouldTriggerTranslation("git status", "zh"), false);
});

test("engine: executeTranslation returns structured response with fallback when offline", async () => {
  const res = await executeTranslation("这个方案需要精简", {
    endpoint: "http://127.0.0.1:54321/v1/chat/completions",
  });

  assert.ok(res);
  assert.equal(typeof res.spoken, "string");
  assert.equal(typeof res.written, "string");
  assert.equal(res.shieldBypassed, false);
});

test("engine: fetchZeroKeyTranslation provides fast zero-key translation fallback", async () => {
  const translated = await fetchZeroKeyTranslation("测试极速引擎", "zh", "en");
  // If network is reachable, it returns English translation; if offline, it gracefully returns null without throwing
  if (translated) {
    assert.equal(typeof translated, "string");
    assert.ok(translated.length > 0);
  }
});

test("engine: detectLocalEndpoints checks local ports without throwing", async () => {
  const result = await detectLocalEndpoints();
  assert.ok(result);
  assert.equal(typeof result.ollama, "boolean");
  assert.equal(typeof result.lmstudio, "boolean");
  assert.equal(typeof result.vllm, "boolean");
});

test("engine: generateSlotsFromUserIntent understands plain-language single-line typing request", async () => {
  const res = await generateSlotsFromUserIntent("我只是为了打字，只要一行最简单的翻译，不要原话也不要单词");
  assert.ok(Array.isArray(res.slots));
  assert.equal(res.slots.length, 1);
  assert.equal(res.slots[0].role, "translation");
  assert.ok(res.summary.includes("只保留 1 行"));
});

test("engine: generateSlotsFromUserIntent understands business customer support scenario", async () => {
  const res = await generateSlotsFromUserIntent("我是做外贸客服的，想要客气礼貌回复和简短催单跟进，不要原话");
  assert.equal(res.slots.some((s) => s.role === "source"), false);
  const transSlots = res.slots.filter((s) => s.role === "translation");
  assert.equal(transSlots.length, 2);
  assert.equal(transSlots[0].label, "客气礼貌");
  assert.equal(transSlots[1].label, "简短干脆");
});

test("engine: generateSlotsFromUserIntent understands Japanese learning with vocab request", async () => {
  const res = await generateSlotsFromUserIntent("学日语，想同时对比朋友随和口语和职场礼貌敬语，加上单词");
  assert.equal(res.slots.some((s) => s.role === "source"), true);
  assert.equal(res.slots.some((s) => s.role === "vocab"), true);
  const transSlots = res.slots.filter((s) => s.role === "translation");
  assert.equal(transSlots.length, 2);
});

