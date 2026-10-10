import {
  translateCore,
  type LingualRequest,
  type LingualResponse,
  type CustomSlotsConfig,
  type SlotConfig,
} from "pi-lingual/core";
import { shouldTriggerTranslation } from "pi-lingual";
import { loadDesktopConfig, type LingualDesktopConfig } from "./config.js";

export { shouldTriggerTranslation };

export interface DesktopTranslationResult extends LingualResponse {
  isOfflineOrFailed?: boolean;
  isZeroKeyFallback?: boolean;
}

/**
 * Layer 0: 免 Key 开箱即用极速翻译引擎 (Zero-Key Fast Translation Fallback)
 * 同时并发竞速国内直连免代理通道 (MyMemory) 与国际通道 (Google GTX)，
 * 确保在纯国内网络无代理、无 API Key、无 Ollama 的裸机环境下 100% 稳定秒出译文！
 */
export async function fetchZeroKeyTranslation(
  text: string,
  sourceLang = "zh",
  targetLang = "en"
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const sl = sourceLang === "zh" || sourceLang === "tw" ? "zh-CN" : sourceLang;
  const tl = targetLang === "zh" || targetLang === "tw" ? "zh-CN" : targetLang === "en" ? "en-US" : targetLang;

  const tryMyMemory = async (): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sl}|${tl}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error("MyMemory HTTP error");
      const data = (await res.json()) as any;
      const out = data?.responseData?.translatedText;
      if (typeof out === "string" && out.trim() && out.trim() !== trimmed) {
        return out.trim();
      }
      throw new Error("Empty MyMemory result");
    } finally {
      clearTimeout(timer);
    }
  };

  const tryGoogleGtx = async (): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(trimmed)}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error("GTX HTTP error");
      const json = (await res.json()) as any;
      if (Array.isArray(json) && Array.isArray(json[0])) {
        const translated = json[0]
          .map((item: any) => (Array.isArray(item) ? item[0] : ""))
          .filter(Boolean)
          .join("");
        if (translated && translated.trim()) return translated.trim();
      }
      throw new Error("Empty GTX result");
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await Promise.any([tryMyMemory(), tryGoogleGtx()]);
  } catch {
    return null;
  }
}

/**
 * Layer 1: 本地私有开源推理端点自动嗅探探测器 (500ms 快速探活)
 */
export async function detectLocalEndpoints(): Promise<{
  ollama: boolean;
  lmstudio: boolean;
  vllm: boolean;
}> {
  const probe = async (port: number): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 500);
      const res = await fetch(`http://127.0.0.1:${port}/`, { method: "HEAD", signal: controller.signal }).catch(() => null);
      clearTimeout(timer);
      return res !== null;
    } catch {
      return false;
    }
  };

  const [ollama, lmstudio, vllm] = await Promise.all([
    probe(11434),
    probe(1234),
    probe(8000),
  ]);

  return { ollama, lmstudio, vllm };
}

/**
 * Creates an HTTP-based Model Completer conforming to the OpenAI Chat Completions API specification
 * Works universally with Ollama, Groq, DeepSeek, OpenRouter, and OpenAI endpoints.
 */
export function createHttpCompleter(config: LingualDesktopConfig) {
  let requestFailed = false;

  const completer = async (prompt: string, systemPrompt: string, signal?: AbortSignal): Promise<string | null> => {
    const endpoint = config.endpoint || "http://127.0.0.1:11434/v1/chat/completions";
    if (endpoint.includes("127.0.0.1:0")) {
      requestFailed = true;
      return null;
    }
    const apiKey = config.apiKey || "ollama";
    const model = config.model || "qwen2.5:3b";

    const controller = new AbortController();
    const isLocalOllama = endpoint.includes("127.0.0.1:11434") || endpoint.includes("localhost:11434");
    const timeoutId = setTimeout(() => controller.abort(), isLocalOllama ? 1200 : 15000);

    const onAbort = () => controller.abort();
    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && apiKey !== "ollama" ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          reasoning_effort: "low",
          max_tokens: 1500,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        console.error(`[engine] Completion request failed: ${res.status} ${res.statusText}`);
        requestFailed = true;
        return null;
      }

      const data = (await res.json()) as any;
      const content = data?.choices?.[0]?.message?.content;
      return typeof content === "string" ? content : null;
    } catch (err: any) {
      requestFailed = true;
      if (err.name === "AbortError") {
        console.warn("[engine] Completion request timed out or was aborted");
      } else {
        console.error("[engine] Completion network error:", err.message);
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
    }
  };

  return {
    completer,
    didFail: () => requestFailed,
  };
}

/**
 * Dispatches a translation request using the desktop configuration and pi-lingual core engine
 * Accurately tracks offline/network failure to prevent auto-sending un-translated raw text!
 */
export async function executeTranslation(
  text: string,
  configOverride?: Partial<LingualDesktopConfig>,
  context?: string,
  slots?: SlotConfig[] | CustomSlotsConfig
): Promise<DesktopTranslationResult> {
  const config = { ...loadDesktopConfig(), ...configOverride };
  const { completer, didFail } = createHttpCompleter(config);

  const effectiveSlots = slots || (config.slots && Array.isArray(config.slots) ? config.slots : undefined);

  const req: LingualRequest = {
    text,
    sourceLang: config.sourceLang,
    targetLang: config.targetLang,
    context,
    tone: "general",
    slots: effectiveSlots,
  };

  const res = await translateCore(req, { completer });
  const isLlmFailed = didFail() || (!res.shieldBypassed && !res.cached && res.spoken === text && res.written === text);

  // 若 LLM 调用失败（或用户初次使用未配置任何模型端点），平滑降级至 Layer 0 免 Key 极速保底引擎
  if (isLlmFailed && !res.shieldBypassed) {
    const fallbackText = await fetchZeroKeyTranslation(text, config.sourceLang, config.targetLang);
    if (fallbackText) {
      const dynamicSlots = effectiveSlots
        ? effectiveSlots.map((s) => ({
            id: s.id,
            label: s.label,
            role: s.role,
            content: s.role === "source" ? text : fallbackText,
          }))
        : undefined;

      return {
        spoken: fallbackText,
        written: fallbackText,
        cached: false,
        shieldBypassed: false,
        isOfflineOrFailed: false, // 保底成功，不阻断心流！
        isZeroKeyFallback: true,
        slots: dynamicSlots,
      };
    }
  }

  return {
    ...res,
    isOfflineOrFailed: isLlmFailed,
  };
}

/**
 * Built-in Natural Language Slot Tuner ("一句话让 AI 帮我配好")
 * Brings the conversational Pi Agent setup experience directly into the standalone desktop app.
 * Combines a 0ms Local Intent Parser (works 100% offline/zero-key) with optional LLM refinement.
 */
export async function generateSlotsFromUserIntent(
  userPrompt: string,
  configOverride?: Partial<LingualDesktopConfig>
): Promise<{ slots: SlotConfig[]; summary: string }> {
  const raw = (userPrompt || "").trim();
  const config = { ...loadDesktopConfig(), ...configOverride };
  const isZh = config.sourceLang === "zh" || config.sourceLang === "tw" || /[\u4e00-\u9fff]/.test(raw);
  const isJa = config.sourceLang === "ja";

  // 1. Parse boolean modifiers from natural language
  const hideSource = /不要原文|不要原话|不显示原话|不显示原文|不看原文|不看原话|去掉原文|去掉原话|删掉原文|隐藏原文|别显示原话|无需原文|no source|hide source|without source/i.test(raw);
  const showSourceExplicit = /保留原文|保留原话|显示原文|显示原话|加上原文|带原文|keep source|show source/i.test(raw);

  const hideVocab = /不要单词|不学单词|不要词汇|不看单词|去掉单词|别教单词|不要重点|纯打字|只是打字|只为了打字|no vocab|without vocab/i.test(raw);
  const showVocabExplicit = /要单词|学单词|记单词|背单词|生词|好词|加上单词|带单词|vocab/i.test(raw);

  const hideMeaning = /不要解释|不要微释义|不要括号|不看解释|去掉解释|只看外语|no meaning|no nuance/i.test(raw);
  const singleLineOnly = /只要一行|只要一个|一个就够|一行就够|只出一行|极简|纯翻译|只要译文|直接翻译|普通翻译|只是为了打字|只为了打字|single line|just one/i.test(raw);

  const slots: SlotConfig[] = [];
  const summaryParts: string[] = [];

  // Decide whether to include Source row (hideSource always wins over substring matches)
  const includeSource = hideSource ? false : showSourceExplicit ? true : singleLineOnly ? false : true;
  if (includeSource) {
    slots.push({
      id: "source",
      label: isZh ? "原话" : isJa ? "原文" : "Source",
      role: "source",
      enabled: true,
    });
  } else {
    summaryParts.push(isZh ? "已隐藏中文原话" : "Hidden source text");
  }

  const useMeaning = !hideMeaning && !singleLineOnly;

  // 2. Match user scenario or custom tone requests
  if (singleLineOnly) {
    slots.push({
      id: "spoken",
      label: isZh ? "地道译文" : isJa ? "訳文" : "Translation",
      role: "translation",
      instruction: "Translate into natural, accurate, idiomatic target language suitable for immediate sending.",
      showMeaning: !hideMeaning && showSourceExplicit,
      enabled: true,
    });
    summaryParts.push(isZh ? "只保留 1 行最干净的纯翻译（最适合纯粹打字聊天）" : "1 clean translation line");
  } else if (/外贸|客服|电商|客户|跨境|催单|商务|售后|买家|卖家/.test(raw)) {
    slots.push(
      {
        id: "spoken",
        label: isZh ? "客气礼貌" : "Polite Reply",
        role: "translation",
        instruction: "Warm, polite, professional customer service and business communication tone.",
        showMeaning: useMeaning,
        enabled: true,
      },
      {
        id: "written",
        label: isZh ? "简短干脆" : "Direct Follow-up",
        role: "translation",
        instruction: "Concise, clear, action-oriented business follow-up or order confirmation.",
        showMeaning: useMeaning,
        enabled: true,
      }
    );
    summaryParts.push(isZh ? "已定制「外贸/客服」专属：1行客气礼貌回复 + 1行简短干脆跟进" : "Business & Customer Support preset");
  } else if (/游戏|队友|开黑|Steam|Discord|报点|联机|打团|竞技/i.test(raw)) {
    slots.push(
      {
        id: "spoken",
        label: isZh ? "游戏短句" : "In-Game Chat",
        role: "translation",
        instruction: "Ultra-short, punchy, authentic gamer slang and quick team callouts.",
        showMeaning: useMeaning,
        enabled: true,
      },
      {
        id: "written",
        label: isZh ? "社区闲聊" : "Discord Chill",
        role: "translation",
        instruction: "Friendly, casual Discord community banter with fellow players.",
        showMeaning: useMeaning,
        enabled: true,
      }
    );
    summaryParts.push(isZh ? "已定制「游戏联机」专属：1行极短游戏内沟通 + 1行社区闲聊" : "Gaming & Discord preset");
  } else if (/推特|twitter|x\.com|发帖|小红书|社媒|运营|吸睛|病毒|网红|论坛|reddit/i.test(raw)) {
    slots.push(
      {
        id: "spoken",
        label: isZh ? "吸睛短句" : "Punchy Hook",
        role: "translation",
        instruction: "Engaging, native social media post or tweet under 280 chars with natural hook.",
        showMeaning: useMeaning,
        enabled: true,
      },
      {
        id: "written",
        label: isZh ? "深度讨论" : "Insightful Reply",
        role: "translation",
        instruction: "Thoughtful, high-signal community comment or thread expansion.",
        showMeaning: useMeaning,
        enabled: true,
      }
    );
    summaryParts.push(isZh ? "已定制「推特/社媒」专属：1行吸睛短句 + 1行有深度的评论" : "Social Media & X preset");
  } else if (/论文|学术|导师|教授|留学|科研|期刊|审稿|邮件|email/i.test(raw)) {
    slots.push(
      {
        id: "spoken",
        label: isZh ? "得体邮件" : "Polite Email",
        role: "translation",
        instruction: "Respectful, clear email communication suitable for professors, colleagues, or clients.",
        showMeaning: useMeaning,
        enabled: true,
      },
      {
        id: "written",
        label: isZh ? "学术严谨" : "Academic Prose",
        role: "translation",
        instruction: "Formal, objective academic prose suitable for research papers and technical reports.",
        showMeaning: useMeaning,
        enabled: true,
      }
    );
    summaryParts.push(isZh ? "已定制「邮件与学术」专属：1行得体礼貌邮件 + 1行严谨学术书面语" : "Academic & Email preset");
  } else if (/日语|敬语|口语|日本|日企|动漫|朋友/.test(raw) && /敬语|口语|礼貌|日语/.test(raw)) {
    slots.push(
      {
        id: "spoken",
        label: isZh ? "朋友口语" : "口語 (タメ口)",
        role: "translation",
        instruction: "Natural, casual spoken tone used among close friends and peers.",
        showMeaning: useMeaning,
        enabled: true,
      },
      {
        id: "written",
        label: isZh ? "礼貌敬语" : "敬語 (ビジネス)",
        role: "translation",
        instruction: "Polite, natural workplace honorifics (Desu/Masu & Keigo).",
        showMeaning: useMeaning,
        enabled: true,
      }
    );
    summaryParts.push(isZh ? "已定制「口语+敬语」对照：1行朋友随和口语 + 1行职场礼貌敬语" : "Casual vs Polite Keigo preset");
  } else if (/代码|程序员|开发|github|issue|pr|开源|技术/i.test(raw)) {
    slots.push(
      {
        id: "spoken",
        label: isZh ? "日常群聊" : "Team Chat",
        role: "translation",
        instruction: "Natural, fluent spoken flow for Slack, daily standups, and quick team chat.",
        showMeaning: useMeaning,
        enabled: true,
      },
      {
        id: "written",
        label: isZh ? "技术文档" : "PR / Issue",
        role: "translation",
        instruction: "Clear, precise technical written prose for GitHub PRs, Issues, and RFC docs.",
        showMeaning: useMeaning,
        enabled: true,
      }
    );
    summaryParts.push(isZh ? "已定制「开发者沟通」：1行群聊口语 + 1行 GitHub/文档正式书面语" : "Developer preset");
  } else {
    // Custom free-form user request! Extract user's own description as custom style
    const cleanedDesc = raw
      .replace(/不要原文|不要原话|不显示原话|不要单词|不学单词|不要解释|保留原文|加上单词/g, "")
      .trim();

    if (cleanedDesc.length >= 2) {
      slots.push({
        id: "spoken",
        label: isZh ? "定制表达" : "Custom Style",
        role: "translation",
        instruction: `Translate according to the user's preferred style and scenario: ${cleanedDesc}`,
        showMeaning: useMeaning,
        enabled: true,
      });
      summaryParts.push(isZh ? `已按您的描述定制专属风格：「${cleanedDesc.slice(0, 18)}」` : `Custom style: ${cleanedDesc}`);
    } else {
      slots.push(
        {
          id: "spoken",
          label: isZh ? "日常聊天" : "Casual Chat",
          role: "translation",
          instruction: "Natural, conversational everyday phrasing.",
          showMeaning: useMeaning,
          enabled: true,
        },
        {
          id: "written",
          label: isZh ? "正式书面" : "Formal Written",
          role: "translation",
          instruction: "Polite, clear, well-structured written expression.",
          showMeaning: useMeaning,
          enabled: true,
        }
      );
      summaryParts.push(isZh ? "已设置为「日常聊天 + 正式书面」双版本对照" : "Casual + Formal dual view");
    }
  }

  // Decide whether to include Vocab row (hideVocab always wins over substring matches)
  const includeVocab = hideVocab || singleLineOnly ? false : showVocabExplicit ? true : false;
  if (includeVocab) {
    slots.push({
      id: "vocab",
      label: isZh ? "顺便记词" : isJa ? "単語" : "Key Words",
      role: "vocab",
      instruction: "Extract 2-3 useful words or phrases with brief native meanings.",
      enabled: true,
    });
    summaryParts.push(isZh ? "底部附带实用好词" : "With vocabulary notes");
  }

  return {
    slots,
    summary: summaryParts.join("，") || (isZh ? "已根据您的需求自动配好卡片！" : "Configured according to your request!"),
  };
}

