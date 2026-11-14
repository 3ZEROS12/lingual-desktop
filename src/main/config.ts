import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getDefaultSlots, type SlotConfig } from "pi-lingual/core";

export type CompanionMode = "original" | "english" | "select" | "modify" | "off";
export type SlotPreset = "developer" | "social" | "japanese" | "academic" | "custom";
export type EngineProviderMode = "pi" | "free" | "custom";

/**
 * Normalizes a language tag into one of the 9 canonical desktop language codes.
 * Handles regional variants such as zh-CN / zh-TW / zh-Hant / pt-BR without
 * collapsing them into the wrong script family.
 */
const LANG_TAG_ALIASES: Record<string, string> = {
  "zh-cn": "zh",
  "zh-hans": "zh",
  "zh-sg": "zh",
  "zh-tw": "tw",
  "zh-hk": "tw",
  "zh-mo": "tw",
  "zh-hant": "tw",
};

export function normalizeDesktopLangTag(lang?: string): string {
  const raw = (lang || "").trim().toLowerCase().replace(/_/g, "-");
  if (!raw) return "en";
  const alias = LANG_TAG_ALIASES[raw];
  if (alias) return alias;
  return raw.split("-")[0] || "en";
}

/** Single-slot direct mode labels across all 9 supported languages. */
const DIRECT_SLOT_LABELS: Record<string, string> = {
  en: "Direct",
  zh: "直出",
  tw: "直出",
  ja: "直訳",
  ko: "직출",
  es: "Directo",
  fr: "Direct",
  de: "Direkt",
  ru: "Прямой",
};

/** Candidate (3-tone) mode labels across all 9 supported languages. */
const CANDIDATE_SLOT_LABELS: Record<string, { source: string; casual: string; polite: string; concise: string }> = {
  en: { source: "Source", casual: "Casual", polite: "Polite", concise: "Concise" },
  zh: { source: "原文", casual: "随和口语", polite: "得体礼貌", concise: "精炼干脆" },
  tw: { source: "原文", casual: "隨和口語", polite: "得體禮貌", concise: "精煉乾脆" },
  ja: { source: "原文", casual: "カジュアル", polite: "丁寧・敬語", concise: "簡潔・要点" },
  ko: { source: "원문", casual: "구어·친근", polite: "정중·비즈니스", concise: "간결·핵심" },
  es: { source: "Original", casual: "Coloquial", polite: "Cortés", concise: "Conciso" },
  fr: { source: "Original", casual: "Courant", polite: "Poli", concise: "Concis" },
  de: { source: "Original", casual: "Umgangssprachlich", polite: "Höflich", concise: "Prägnant" },
  ru: { source: "Оригинал", casual: "Разговорный", polite: "Вежливый", concise: "Лаконичный" },
};

/** Modify (surgical fix) mode labels across all 9 supported languages. */
const MODIFY_SLOT_LABELS: Record<string, { fixed: string; native: string; fixes: string }> = {
  en: { fixed: "Fixed", native: "Native", fixes: "Takeaway" },
  zh: { fixed: "原句修补", native: "地道表达", fixes: "收获复盘" },
  tw: { fixed: "原句修補", native: "道地表達", fixes: "收穫複盤" },
  ja: { fixed: "原文修正", native: "自然表現", fixes: "重要ポイント" },
  ko: { fixed: "원문수정", native: "자연스러운표현", fixes: "핵심포인트" },
  es: { fixed: "Corregido", native: "Nativo", fixes: "Aprendizaje" },
  fr: { fixed: "Corrigé", native: "Naturel", fixes: "À retenir" },
  de: { fixed: "Korrigiert", native: "Nativ", fixes: "Erkenntnis" },
  ru: { fixed: "Исправлено", native: "Естественно", fixes: "Вывод" },
};

/** Human-readable English language names used inside generated prompt instructions. */
const LANGUAGE_ENGLISH_NAMES: Record<string, string> = {
  en: "English",
  zh: "Simplified Chinese",
  tw: "Traditional Chinese",
  ja: "Japanese",
  ko: "Korean",
  es: "Spanish",
  fr: "French",
  de: "German",
  ru: "Russian",
  pt: "Portuguese",
  it: "Italian",
};

export function getLanguageEnglishName(lang?: string): string {
  return LANGUAGE_ENGLISH_NAMES[normalizeDesktopLangTag(lang)] || "English";
}

/**
 * Reply Copilot intent labels (desktop-only surface).
 * Unlike pi-lingual's tone registers (Casual / Polite / Formal), replies to a real human
 * are chosen by communicative MOVE first: accept, decline, or ask back.
 */
const REPLY_INTENT_LABELS: Record<string, { inbound: string; accept: string; decline: string; ask: string }> = {
  en: { inbound: "What they mean", accept: "Accept", decline: "Decline", ask: "Ask back" },
  zh: { inbound: "对方在说什么", accept: "答应", decline: "婉拒", ask: "追问" },
  tw: { inbound: "對方在說什麼", accept: "答應", decline: "婉拒", ask: "追問" },
  ja: { inbound: "相手の意図", accept: "承諾", decline: "丁寧に断る", ask: "聞き返す" },
  ko: { inbound: "상대 의도", accept: "수락", decline: "정중히 거절", ask: "되묻기" },
  es: { inbound: "Qué quiere decir", accept: "Aceptar", decline: "Rechazar", ask: "Preguntar" },
  fr: { inbound: "Ce qu'il veut dire", accept: "Accepter", decline: "Refuser", ask: "Demander" },
  de: { inbound: "Was gemeint ist", accept: "Zusagen", decline: "Absagen", ask: "Nachfragen" },
  ru: { inbound: "Что имеется в виду", accept: "Согласиться", decline: "Отказаться", ask: "Уточнить" },
};

/**
 * Reply Copilot slots: 1 comprehension row + 3 reply moves.
 * Labels are always rendered in the user's native language; the drafts are generated in
 * `replyLang` — the language the counterpart actually wrote in.
 */
export function getDefaultDesktopReplySlots(nativeLang = "zh", replyLang = "en"): SlotConfig[] {
  const nat = normalizeDesktopLangTag(nativeLang);
  const rep = normalizeDesktopLangTag(replyLang);
  const l = REPLY_INTENT_LABELS[nat] || REPLY_INTENT_LABELS.en;
  const nativeName = getLanguageEnglishName(nat);
  const replyName = getLanguageEnglishName(rep);

  return [
    {
      id: "context_inbound",
      label: l.inbound,
      role: "custom",
      showMeaning: false,
      enabled: true,
      instruction: `Explain in ${nativeName} what the incoming message actually asks for, in at most 2 short sentences. Translate it first if it is not already in ${nativeName}. Keep names, numbers, dates, prices and links verbatim.`,
    },
    {
      id: "reply_accept",
      label: l.accept,
      role: "translation",
      showMeaning: false,
      enabled: true,
      instruction: `Draft a ${replyName} reply that AGREES and confirms, answering every explicit question in the incoming message. 1-2 natural sentences, ready to send verbatim. No greeting, no sign-off, no placeholders.`,
    },
    {
      id: "reply_decline",
      label: l.decline,
      role: "translation",
      showMeaning: false,
      enabled: true,
      instruction: `Draft a ${replyName} reply that DECLINES or defers politely while keeping the relationship intact, offering a concrete alternative when one is natural. 1-2 sentences, ready to send verbatim. No greeting, no sign-off.`,
    },
    {
      id: "reply_ask",
      label: l.ask,
      role: "translation",
      showMeaning: false,
      enabled: true,
      instruction: `Draft a ${replyName} reply that ASKS BACK for the one detail that is actually blocking a decision. Exactly one clear question, 1-2 sentences, ready to send verbatim. No greeting, no sign-off.`,
    },
  ];
}

/**
 * Label for the incoming-message row in Reply Copilot, rendered in the user's native language.
 */
const REPLY_SOURCE_LABELS: Record<string, string> = {
  en: "Incoming",
  zh: "来信",
  tw: "來信",
  ja: "受信",
  ko: "받은 메시지",
  es: "Recibido",
  fr: "Reçu",
  de: "Eingang",
  ru: "Входящее",
};

export function getReplySourceLabel(nativeLang = "zh"): string {
  return REPLY_SOURCE_LABELS[normalizeDesktopLangTag(nativeLang)] || REPLY_SOURCE_LABELS.en;
}

/** Cognitive explanation language directives for Modify mode takeaways. */
const EXPLAIN_LANG_DESC: Record<string, string> = {  en: "Explain the intuition/rule briefly in simple, clear English.",
  zh: "Explain the intuition/rule briefly in Chinese (中文).",
  tw: "Explain the intuition/rule briefly in Traditional Chinese (繁體中文).",
  ja: "Explain the intuition/rule briefly in Japanese (日本語).",
  ko: "Explain the intuition/rule briefly in Korean (한국어).",
  es: "Explain the intuition/rule briefly in Spanish (Español).",
  fr: "Explain the intuition/rule briefly in French (Français).",
  de: "Explain the intuition/rule briefly in German (Deutsch).",
  ru: "Explain the intuition/rule briefly in Russian (Русский).",
};

export function getDefaultDesktopDirectSlots(sourceLang = "en"): SlotConfig[] {
  const norm = normalizeDesktopLangTag(sourceLang);
  const label = DIRECT_SLOT_LABELS[norm] || DIRECT_SLOT_LABELS.en;
  return [
    {
      id: "direct",
      label,
      role: "translation",
      instruction:
        "Output 1 single most natural, idiomatic, ready-to-send sentence matching the active application context. If the input mixes target-language and native-language words (Code-Switch), preserve the existing target-language skeleton 100% verbatim and seamlessly splice the native fragments into idiomatic target prose.",
      showMeaning: false,
      enabled: true,
    },
  ];
}

export function getDefaultDesktopCandidateSlots(sourceLang = "en"): SlotConfig[] {
  const norm = normalizeDesktopLangTag(sourceLang);
  const l = CANDIDATE_SLOT_LABELS[norm] || CANDIDATE_SLOT_LABELS.en;
  return [
    {
      id: "source",
      label: l.source,
      role: "source",
      enabled: true,
    },
    {
      id: "casual",
      label: l.casual,
      role: "translation",
      instruction: "Natural, friendly, conversational phrasing for teammates, friends, and quick IM chat (Slack/WeChat/Discord).",
      showMeaning: true,
      enabled: true,
    },
    {
      id: "polite",
      label: l.polite,
      role: "translation",
      instruction: "Warm, tactful, high-EQ polite phrasing suitable for clients, leads, cross-team collaboration, and business emails.",
      showMeaning: true,
      enabled: true,
    },
    {
      id: "concise",
      label: l.concise,
      role: "translation",
      instruction: "Crisp, high-signal, direct professional statement without filler — ideal for PRs, issues, and executive updates.",
      showMeaning: true,
      enabled: true,
    },
  ];
}

export function getDefaultDesktopModifySlots(sourceLang = "en", explainLang?: string): SlotConfig[] {
  const norm = normalizeDesktopLangTag(sourceLang);
  const expNorm = normalizeDesktopLangTag(explainLang || sourceLang);
  const l = MODIFY_SLOT_LABELS[norm] || MODIFY_SLOT_LABELS.en;
  const explainLangDesc = EXPLAIN_LANG_DESC[expNorm] || EXPLAIN_LANG_DESC.en;

  return [
    {
      id: "fixed",
      label: l.fixed,
      role: "translation",
      instruction:
        "Surgically correct ONLY spelling mistakes, fast typos, syntax structure (e.g. 'want that you can' ➔ 'want you to'), wrong prepositions/articles (e.g. 'in X' ➔ 'on X', 'as I\\'m' ➔ 'as if I\\'m'), and grammatical slips in the user's sentence. CRITICAL RULES: (1) Zero Level Leap (i+1 Rule): STRICTLY match the user's current vocabulary tier and tone! If user writes everyday dev or junior-high level English, do NOT artificially inflate it into university academic GRE/SAT prose or corporate fluff. Fix the joints and syntax, but NEVER replace their words with alien SAT vocabulary! (2) Zero Tone Sanitization: NEVER sanitize, censor, or tone down swear words or raw emotions (e.g. 'fuck', 'suck', 'shit', 'idiot')—passion and emotional heat are natural and MUST be preserved 100%! (3) Zero Punctuation/Casing Nitpicking: Do NOT obsess over casual lowercase casing (e.g. 'l' vs 'L') or missing trailing periods/commas ('.', ',') if the user writes informally. (4) 100% preserve original sentence structure, words, and cadence so the user can send it immediately with zero hesitation.",
      showMeaning: false,
      enabled: true,
    },
    {
      id: "native",
      label: l.native,
      role: "translation",
      instruction:
        "Provide a natural, idiomatic native phrasing expressing the exact same intent. Keep the gap between 'Fixed' and 'Native' small and realistic—do NOT jump vocabulary tiers and do NOT turn it into an essay.",
      showMeaning: true,
      enabled: true,
    },
    {
      id: "fixes",
      label: l.fixes,
      role: "vocab",
      instruction: `Extract 1-3 essential takeaways covering syntax structure, word choice & collocations, and grammar slips in the format: 'typo ➔ fix · in X ➔ on X (concise takeaway)'. ${explainLangDesc}`,
      enabled: true,
    },
  ];
}

export interface LingualDesktopConfig {
  uiLang: string;
  engineProvider: EngineProviderMode;
  endpoint: string;
  apiKey: string;
  model: string;
  sourceLang: string;
  targetLang: string;
  explainLang?: string;
  mode: CompanionMode;
  slotPreset: SlotPreset;
  slots: SlotConfig[];
  directSlots?: SlotConfig[];
  candidateSlots?: SlotConfig[];
  promptSlots?: SlotConfig[];
  modifySlots?: SlotConfig[];
  /** Reply Copilot slot overrides. Left undefined so defaults regenerate per inbound language. */
  replySlots?: SlotConfig[];
  autoSend: boolean;
  showCapsule: boolean;
  /** Suppresses AI-slop clichés ("delve", "seamless", "robust"...) via pi-lingual's Kill List directive. */
  killListEnabled?: boolean;
  /** User-extended forbidden word list; merged with pi-lingual's DEFAULT_KILL_LIST. */
  globalKillList?: string[];
  enableGlobalShortcuts: boolean;
  autoStartOnBoot?: boolean;
  hotkeyToggleMode: string;
  hotkeySubmit: string;
  hotkeyRewrite: string;
  hotkeySpotlight: string;
  hotkeyReply: string;
  capsulePos?: { x: number; y: number } | null;
  piModelInfo?: { endpoint: string; model: string; apiKey?: string } | null;
}

export const DEFAULT_DESKTOP_CONFIG: LingualDesktopConfig = {
  uiLang: "zh",
  engineProvider: "pi",
  endpoint: "",
  apiKey: "",
  model: "",
  sourceLang: "zh",
  targetLang: "en",
  mode: "original",
  slotPreset: "developer",
  slots: getDefaultSlots("en"),
  directSlots: getDefaultDesktopDirectSlots("en"),
  candidateSlots: getDefaultDesktopCandidateSlots("en"),
  promptSlots: getDefaultDesktopCandidateSlots("en"),
  modifySlots: getDefaultDesktopModifySlots("en"),
  autoSend: true,
  showCapsule: true,
  killListEnabled: true,
  globalKillList: [],
  enableGlobalShortcuts: true,
  autoStartOnBoot: false,
  hotkeyToggleMode: "Alt+Q",
  hotkeySubmit: "Enter",
  hotkeyRewrite: "Alt+E",
  hotkeySpotlight: "Alt+Space",
  hotkeyReply: "Alt+R",
  capsulePos: null,
};

/**
 * Validates and normalizes Electron global accelerator strings.
 * Disallows bare keys without modifiers (e.g. "Enter", "Space", "A") to prevent hijacking system keys.
 * Returns empty string if disabled ("none", "off", empty) or invalid.
 */
export function sanitizeAccelerator(acc?: string): string {
  if (!acc || typeof acc !== "string") return "";
  const trimmed = acc.trim();
  if (!trimmed || trimmed.toLowerCase() === "none" || trimmed.toLowerCase() === "off") {
    return "";
  }

  // Split tokens by '+'
  const tokens = trimmed.split("+").map((t) => t.trim()).filter(Boolean);
  if (tokens.length <= 1) {
    // Single bare key without modifier is strictly forbidden to protect user input!
    return "";
  }

  const modifiers: string[] = [];
  let mainKey = "";

  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (lower === "ctrl" || lower === "control") {
      modifiers.push("CommandOrControl");
    } else if (lower === "alt") {
      modifiers.push("Alt");
    } else if (lower === "shift") {
      modifiers.push("Shift");
    } else if (lower === "meta" || lower === "win" || lower === "super" || lower === "cmd" || lower === "command") {
      modifiers.push("Super");
    } else {
      if (lower === "space") {
        mainKey = "Space";
      } else if (lower === "return" || lower === "enter") {
        // Disallow Enter as a global shortcut combination to avoid hijacking
        return "";
      } else if (lower.length === 1) {
        mainKey = lower.toUpperCase();
      } else {
        mainKey = token.charAt(0).toUpperCase() + token.slice(1);
      }
    }
  }

  if (modifiers.length === 0 || !mainKey) {
    return "";
  }

  const uniqueMods = Array.from(new Set(modifiers));
  return [...uniqueMods, mainKey].join("+");
}

function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.NODE_TEST_CONTEXT !== undefined ||
    process.execArgv.some((a) => a.startsWith("--test") || a === "--test") ||
    process.argv.some((a) => a.includes(".test.")) ||
    process.env.npm_lifecycle_event === "test"
  );
}

export function getConfigDir(): string {
  const dir = isTestEnvironment()
    ? path.join(os.tmpdir(), "lingual-desktop-test-sandbox")
    : path.join(os.homedir(), ".lingual");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), "config.json");
}

export function normalizeDesktopMode(raw?: string): CompanionMode {
  const s = (raw || "").trim().toLowerCase();
  if (s === "original" || s === "companion" || s === "learn" || s === "1") return "original";
  if (s === "select" || s === "candidates" || s === "candidate" || s === "3") return "select";
  if (s === "modify" || s === "polish" || s === "fix" || s === "4") return "modify";
  if (s === "off" || s === "0") return "off";
  if (s === "english" || s === "direct" || s === "2") return "english";
  return DEFAULT_DESKTOP_CONFIG.mode;
}

const SUPPORTED_UI_LANGS = new Set(["en", "zh", "tw", "ja", "ko", "es", "fr", "de", "ru", "pt"]);

export function resolveInitialUiLang(explicitUiLang?: string, sourceLang?: string): string {
  if (typeof explicitUiLang === "string" && explicitUiLang.trim()) {
    const clean = explicitUiLang.trim().toLowerCase().split(/[-_]/)[0];
    if (SUPPORTED_UI_LANGS.has(clean)) return clean;
  }
  if (typeof sourceLang === "string" && sourceLang.trim()) {
    const clean = sourceLang.trim().toLowerCase().split(/[-_]/)[0];
    if (SUPPORTED_UI_LANGS.has(clean)) return clean;
  }
  return "en";
}
export function getSharedLingualConfigPath(): string {
  return path.join(os.homedir(), ".pi", "agent", "lingual.json");
}

export function discoverPiModelConfig(preferredModel?: string): { endpoint: string; apiKey: string; model: string } | null {
  try {
    const modelsPath = path.join(os.homedir(), ".pi", "agent", "models.json");
    if (!fs.existsSync(modelsPath)) return null;
    const raw = JSON.parse(fs.readFileSync(modelsPath, "utf8"));
    const providers = raw?.providers;
    if (!providers || typeof providers !== "object") return null;

    // 1. If preferredModel (e.g. from ~/.pi/agent/lingual.json) is specified, match exact model first
    if (preferredModel && typeof preferredModel === "string" && preferredModel.trim()) {
      const targetModelId = preferredModel.trim();
      for (const p of Object.values(providers) as any[]) {
        if (p && typeof p.baseUrl === "string" && Array.isArray(p.models) && p.models.length > 0) {
          const match = p.models.find((m: any) => m.id === targetModelId || m === targetModelId);
          if (match) {
            const base = p.baseUrl.replace(/\/+$/, "");
            const endpoint = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
            return {
              endpoint,
              apiKey: p.apiKey || "",
              model: typeof match === "string" ? match : match.id,
            };
          }
        }
      }
    }

    // 2. Default heuristic: preferred fast reasoning/flash model
    for (const p of Object.values(providers) as any[]) {
      if (p && typeof p.baseUrl === "string" && Array.isArray(p.models) && p.models.length > 0) {
        const base = p.baseUrl.replace(/\/+$/, "");
        const endpoint = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
        const preferred =
          p.models.find((m: any) => /flash|mini|haiku|fast/i.test(m.id || m)) || p.models[0];
        return {
          endpoint,
          apiKey: p.apiKey || "",
          model: typeof preferred === "string" ? preferred : preferred.id,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function loadDesktopConfig(): LingualDesktopConfig {
  let desktopRaw: Partial<LingualDesktopConfig> = {};
  const primaryPath = getConfigPath();
  if (fs.existsSync(primaryPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(primaryPath, "utf8"));
      desktopRaw = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      desktopRaw = {};
    }
  }

  let sharedRaw: Record<string, any> = {};
  const sharedPath = getSharedLingualConfigPath();
  if (!isTestEnvironment() && fs.existsSync(sharedPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const inner = parsed["pi-lingual"] || parsed;
        sharedRaw = inner && typeof inner === "object" && !Array.isArray(inner) ? inner : {};
      }
    } catch {
      sharedRaw = {};
    }
  }

  const piPreferredModel = desktopRaw.model || sharedRaw.model;
  const piDiscovered = !isTestEnvironment() ? discoverPiModelConfig(piPreferredModel) : null;

  // Desktop config is primary; shared config is fallback for initial bootstrap
  const effectiveSourceLang =
    (typeof desktopRaw.sourceLang === "string" && desktopRaw.sourceLang) ||
    (typeof sharedRaw.sourceLang === "string" && sharedRaw.sourceLang) ||
    DEFAULT_DESKTOP_CONFIG.sourceLang;
  const effectiveTargetLang =
    (typeof desktopRaw.targetLang === "string" && desktopRaw.targetLang) ||
    (typeof sharedRaw.targetLang === "string" && sharedRaw.targetLang) ||
    DEFAULT_DESKTOP_CONFIG.targetLang;
  const effectiveUiLang = resolveInitialUiLang(desktopRaw.uiLang, effectiveSourceLang);
  const rawMode = (desktopRaw.mode as string) || (sharedRaw.mode as string) || DEFAULT_DESKTOP_CONFIG.mode;
  const effectiveMode = normalizeDesktopMode(rawMode);
  const effectiveSlotPreset =
    (desktopRaw.slotPreset as SlotPreset) ||
    (sharedRaw.slotPreset as SlotPreset) ||
    DEFAULT_DESKTOP_CONFIG.slotPreset;

  const isValidSlotArray = (arr: unknown): arr is SlotConfig[] =>
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.every((s) => s && typeof s === "object" && typeof (s as any).role === "string" && typeof (s as any).id === "string") &&
    arr.some((s) => (s as any).enabled !== false && (s as any).role !== "source");

  const effectiveSlots = isValidSlotArray(desktopRaw.slots)
    ? desktopRaw.slots
    : isValidSlotArray(sharedRaw.slots)
    ? sharedRaw.slots
    : getDefaultSlots(effectiveSourceLang);

  const effectiveDirectSlots = isValidSlotArray(desktopRaw.directSlots)
    ? desktopRaw.directSlots
    : isValidSlotArray(sharedRaw.directSlots)
    ? sharedRaw.directSlots
    : getDefaultDesktopDirectSlots(effectiveSourceLang);

  const effectiveCandidateSlots = isValidSlotArray(desktopRaw.candidateSlots)
    ? desktopRaw.candidateSlots
    : isValidSlotArray(desktopRaw.promptSlots)
    ? desktopRaw.promptSlots
    : isValidSlotArray(sharedRaw.candidateSlots)
    ? sharedRaw.candidateSlots
    : isValidSlotArray(sharedRaw.promptSlots)
    ? sharedRaw.promptSlots
    : getDefaultDesktopCandidateSlots(effectiveSourceLang);

  const effectiveModifySlots = isValidSlotArray(desktopRaw.modifySlots)
    ? desktopRaw.modifySlots
    : isValidSlotArray(sharedRaw.modifySlots)
    ? sharedRaw.modifySlots
    : getDefaultDesktopModifySlots(effectiveSourceLang);

  const rawSubmitKey = typeof desktopRaw.hotkeySubmit === "string" ? desktopRaw.hotkeySubmit : DEFAULT_DESKTOP_CONFIG.hotkeySubmit;
  const safeHotkeySubmit =
    rawSubmitKey.toLowerCase() === "ctrl+enter" ? "Enter" : rawSubmitKey;

  const engineProvider: EngineProviderMode =
    desktopRaw.engineProvider ||
    (piDiscovered ? "pi" : "free");

  const customEndpoint =
    typeof desktopRaw.endpoint === "string" && desktopRaw.endpoint && !desktopRaw.endpoint.includes("11434") && !desktopRaw.endpoint.includes("127.0.0.1:0")
      ? desktopRaw.endpoint
      : "";
  const customApiKey =
    desktopRaw.apiKey && desktopRaw.apiKey !== "ollama"
      ? desktopRaw.apiKey
      : "";
  const customModel =
    desktopRaw.model && desktopRaw.model !== "qwen2.5:3b"
      ? desktopRaw.model
      : "";

  let resolvedEndpoint = customEndpoint;
  let resolvedApiKey = customApiKey;
  let resolvedModel = customModel;

  if (engineProvider === "free") {
    resolvedEndpoint = "http://127.0.0.1:0/free";
    resolvedApiKey = "";
    resolvedModel = "";
  } else if (engineProvider === "pi" && piDiscovered) {
    resolvedEndpoint = piDiscovered.endpoint;
    resolvedApiKey = piDiscovered.apiKey;
    resolvedModel = piDiscovered.model;
  }

  return {
    ...DEFAULT_DESKTOP_CONFIG,
    ...desktopRaw,
    uiLang: effectiveUiLang,
    engineProvider,
    hotkeySubmit: safeHotkeySubmit,
    hotkeyReply:
      typeof desktopRaw.hotkeyReply === "string" && desktopRaw.hotkeyReply.trim()
        ? desktopRaw.hotkeyReply.trim()
        : DEFAULT_DESKTOP_CONFIG.hotkeyReply,
    replySlots: isValidSlotArray(desktopRaw.replySlots) ? desktopRaw.replySlots : undefined,
    endpoint: resolvedEndpoint,
    apiKey: resolvedApiKey,
    model: resolvedModel,
    sourceLang: effectiveSourceLang,
    targetLang: effectiveTargetLang,
    mode: effectiveMode,
    slotPreset: effectiveSlotPreset,
    slots: effectiveSlots,
    autoStartOnBoot: desktopRaw.autoStartOnBoot === true,
    killListEnabled: desktopRaw.killListEnabled !== false,
    globalKillList: Array.isArray(desktopRaw.globalKillList)
      ? desktopRaw.globalKillList
          .filter((w): w is string => typeof w === "string" && w.trim().length > 0)
          .map((w) => w.trim())
      : [],
    directSlots: effectiveDirectSlots,
    candidateSlots: effectiveCandidateSlots,
    promptSlots: effectiveCandidateSlots,
    modifySlots: effectiveModifySlots,
    piModelInfo: piDiscovered ? { endpoint: piDiscovered.endpoint, model: piDiscovered.model } : null,
  };
}

export function saveDesktopConfig(cfg: Partial<LingualDesktopConfig>): void {
  let existingDesktop: Record<string, any> = {};
  const desktopConfigPath = getConfigPath();
  if (fs.existsSync(desktopConfigPath)) {
    try {
      existingDesktop = JSON.parse(fs.readFileSync(desktopConfigPath, "utf8"));
    } catch {
      existingDesktop = {};
    }
  }

  const merged = {
    ...DEFAULT_DESKTOP_CONFIG,
    ...existingDesktop,
    ...cfg,
  };
  if (cfg.promptSlots && !cfg.candidateSlots) {
    (merged as any).candidateSlots = cfg.promptSlots;
  } else if (cfg.candidateSlots && !cfg.promptSlots) {
    (merged as any).promptSlots = cfg.candidateSlots;
  }
  delete (merged as any).piModelInfo;

  // 1. Atomic write to ~/.lingual/config.json
  const content = JSON.stringify(merged, null, 2);
  const tmpFile = `${desktopConfigPath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
  try {
    fs.writeFileSync(tmpFile, content, "utf8");
    fs.renameSync(tmpFile, desktopConfigPath);
  } catch {
    try {
      fs.writeFileSync(desktopConfigPath, content, "utf8");
    } catch {}
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch {}
  }

  // 2. Sync shared companion fields to ~/.pi/agent/lingual.json
  if (!isTestEnvironment()) {
    try {
      const sharedPath = getSharedLingualConfigPath();
      const agentDir = path.dirname(sharedPath);
      if (!fs.existsSync(agentDir)) {
        fs.mkdirSync(agentDir, { recursive: true });
      }

      let existingShared: Record<string, any> = {};
      if (fs.existsSync(sharedPath)) {
        try {
          existingShared = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
        } catch {}
      }

      // Keep desktop `mode` strictly isolated from Pi CLI `~/.pi/agent/lingual.json`
      // so toggling desktop mode never mutates the terminal coding agent's mode!
      const sharedKeys = ["sourceLang", "targetLang", "slotPreset", "slots", "directSlots", "modifySlots"];
      let hasSharedMutation = false;
      for (const k of sharedKeys) {
        if (k in cfg) {
          existingShared[k] = (cfg as any)[k];
          hasSharedMutation = true;
        }
      }
      if ("candidateSlots" in cfg || "promptSlots" in cfg) {
        existingShared["promptSlots"] = (cfg as any).promptSlots || (cfg as any).candidateSlots;
        hasSharedMutation = true;
      }

      if (hasSharedMutation) {
        const sharedContent = JSON.stringify(existingShared, null, 2);
        const sharedTmp = `${sharedPath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
        try {
          fs.writeFileSync(sharedTmp, sharedContent, "utf8");
          fs.renameSync(sharedTmp, sharedPath);
        } catch {
          try {
            fs.writeFileSync(sharedPath, sharedContent, "utf8");
          } catch {}
          try {
            if (fs.existsSync(sharedTmp)) fs.unlinkSync(sharedTmp);
          } catch {}
        }
      }
    } catch {
      // Non-fatal
    }
  }
}
