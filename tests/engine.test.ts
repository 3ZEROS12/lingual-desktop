import { test } from "node:test";
import assert from "node:assert/strict";
import { executeTranslation } from "../src/main/engine.js";

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

test("engine: executeTranslation returns structured response with fallback when offline", async () => {
  // Point to a non-existent port to simulate graceful offline fallback
  const res = await executeTranslation("这个方案需要精简", {
    endpoint: "http://127.0.0.1:54321/v1/chat/completions",
  });

  assert.ok(res);
  assert.equal(typeof res.spoken, "string");
  assert.equal(typeof res.written, "string");
  assert.equal(res.shieldBypassed, false);
});
