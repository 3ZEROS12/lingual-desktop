import { test } from "node:test";
import assert from "node:assert/strict";
import {
  executeTranslation,
  shouldTriggerTranslation,
  fetchZeroKeyTranslation,
  detectLocalEndpoints,
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
