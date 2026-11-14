import { test } from "node:test";
import assert from "node:assert/strict";
import { planReply, executeReplyDraft } from "../src/main/engine.js";
import { getDefaultDesktopReplySlots, loadDesktopConfig } from "../src/main/config.js";
import { SUPPORTED_LANG_CODES } from "pi-lingual/core";

/**
 * Reply Copilot — the desktop-only surface.
 * pi-lingual can only shape the prompt you hand to an agent; this flow shapes the message
 * a human just sent you, which only an OS-level companion can see.
 */

const baseConfig = () => ({ ...loadDesktopConfig(), sourceLang: "zh", targetLang: "en" });

test("reply: English inbound is answered in English and explained in Chinese", () => {
  const plan = planReply("Hey, can you send the invoice by Friday?", baseConfig());
  assert.equal(plan.nativeLang, "zh");
  assert.equal(plan.inboundLang, "en");
  assert.equal(plan.replyLang, "en");
  assert.deepEqual(
    plan.slots.map((s) => s.id),
    ["context_inbound", "reply_accept", "reply_decline", "reply_ask"]
  );
  assert.match(plan.context, /REPLY CO-PILOT/);
  assert.match(plan.context, /Simplified Chinese/);
});

test("reply: when the sender already writes your native language, you reply in the language you are practising", () => {
  const plan = planReply("你好，请问这周的报表能发我一份吗？", baseConfig());
  assert.equal(plan.inboundLang, "zh");
  assert.equal(plan.nativeLang, "zh");
  assert.equal(plan.replyLang, "en");
});

test("reply: Japanese inbound is answered in Japanese, not forced back into the configured pair", () => {
  const plan = planReply("請求書を金曜日までに送っていただけますか？", baseConfig());
  assert.equal(plan.inboundLang, "ja");
  assert.equal(plan.replyLang, "ja");
  assert.match(plan.context, /Japanese/);
});

test("reply: intent labels are localized in the user's native language for all 9 languages", () => {
  for (const code of SUPPORTED_LANG_CODES) {
    const slots = getDefaultDesktopReplySlots(code, "en");
    assert.equal(slots.length, 4, `${code}: expected 1 comprehension + 3 reply slots`);
    for (const slot of slots) {
      assert.ok(slot.label.trim().length > 0, `${code}: empty reply label`);
      assert.ok(slot.instruction && slot.instruction.length > 40, `${code}: ${slot.id} lacks an instruction`);
    }
    assert.equal(slots[0].id, "context_inbound");
    assert.equal(slots[0].role, "custom");
    assert.deepEqual(
      slots.slice(1).map((s) => s.role),
      ["translation", "translation", "translation"]
    );
  }

  assert.notDeepEqual(
    getDefaultDesktopReplySlots("ja", "en").map((s) => s.label),
    getDefaultDesktopReplySlots("en", "en").map((s) => s.label)
  );
});

test("reply: a full draft set produces an insight row plus three selectable replies", async () => {
  let capturedSystemPrompt = "";
  const res = await executeReplyDraft(
    "Hey, can you send the invoice by Friday?",
    baseConfig(),
    { app: "slack.exe", title: "general - Slack" },
    {
      completer: async (_prompt, systemPrompt) => {
        capturedSystemPrompt = systemPrompt;
        return JSON.stringify({
          context_inbound: "对方希望你在周五前把发票发过去。",
          reply_accept: "Sure, I'll send it over by Friday.",
          reply_decline: "I'm tied up until Friday — can I get it to you Monday?",
          reply_ask: "Happy to — should it be addressed to your finance team?",
        });
      },
    }
  );

  assert.equal(res.isOfflineOrFailed, false);
  assert.equal(res.comprehension, "对方希望你在周五前把发票发过去。");
  assert.equal(res.candidates.length, 3);
  assert.deepEqual(
    res.candidates.map((c) => c.id),
    ["reply_accept", "reply_decline", "reply_ask"]
  );

  // HUD payload: incoming row, non-selectable insight row, then numbered replies.
  assert.equal(res.slots[0].role, "source");
  assert.equal(res.slots[1].selectable, false);
  assert.equal(res.slots[1].content, res.comprehension);
  assert.equal(res.slots.filter((s) => s.selectable !== false && s.role === "translation").length, 3);

  // The Kill List must still apply to drafted replies.
  assert.match(capturedSystemPrompt, /delve/i);
  // App context should reach the prompt as well.
  assert.match(capturedSystemPrompt, /Slack|ACTIVE APPLICATION CONTEXT/i);
});

test("reply: LLM failure is reported honestly instead of returning a fake reply", async () => {
  // Chinese inbound + Chinese native → no network fallback is attempted, keeping this hermetic.
  const res = await executeReplyDraft(
    "你好，请问这周的报表能发我一份吗？",
    baseConfig(),
    undefined,
    { completer: async () => null }
  );

  assert.equal(res.isOfflineOrFailed, true);
  assert.deepEqual(res.candidates, []);
  assert.equal(res.inbound, "你好，请问这周的报表能发我一份吗？");
  assert.equal(res.slots[0].role, "source");
});

test("reply: blank inbound returns an empty result without calling the model", async () => {
  let calls = 0;
  const res = await executeReplyDraft("   ", baseConfig(), undefined, {
    completer: async () => {
      calls += 1;
      return "{}";
    },
  });
  assert.equal(calls, 0);
  assert.equal(res.isOfflineOrFailed, true);
  assert.deepEqual(res.slots, []);
});
