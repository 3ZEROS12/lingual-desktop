import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getDefaultSlots, type SlotConfig } from "pi-lingual/core";

export type CompanionMode = "original" | "english" | "select" | "off";
export type SlotPreset = "developer" | "social" | "japanese" | "academic" | "custom";
export type EngineProviderMode = "pi" | "free" | "custom";

export function getDefaultDesktopDirectSlots(sourceLang = "en"): SlotConfig[] {
  const norm = (sourceLang || "en").toLowerCase().split("-")[0];
  const label = norm === "zh" ? "直出" : norm === "tw" ? "直出" : norm === "ja" ? "直訳" : norm === "ko" ? "직출" : "Direct";
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
  const norm = (sourceLang || "en").toLowerCase().split("-")[0];
  const labels: Record<string, { source: string; casual: string; polite: string; concise: string }> = {
    en: { source: "Source", casual: "Casual", polite: "Polite", concise: "Concise" },
    zh: { source: "原文", casual: "随和口语", polite: "得体礼貌", concise: "精炼干脆" },
    tw: { source: "原文", casual: "隨和口語", polite: "得體禮貌", concise: "精煉乾脆" },
    ja: { source: "原文", casual: "カジュアル", polite: "丁寧・敬語", concise: "簡潔・要点" },
    ko: { source: "원문", casual: "구어·친근", polite: "정중·비즈니스", concise: "간결·핵심" },
  };
  const l = labels[norm] || labels.en;
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

export interface LingualDesktopConfig {
  uiLang: string;
  engineProvider: EngineProviderMode;
  endpoint: string;
  apiKey: string;
  model: string;
  sourceLang: string;
  targetLang: string;
  mode: CompanionMode;
  slotPreset: SlotPreset;
  slots: SlotConfig[];
  directSlots?: SlotConfig[];
  candidateSlots?: SlotConfig[];
  autoSend: boolean;
  showCapsule: boolean;
  hotkeyToggleMode: string;
  hotkeySubmit: string;
  hotkeyRewrite: string;
  hotkeySpotlight: string;
  capsulePos?: { x: number; y: number } | null;
  piModelInfo?: { endpoint: string; model: string } | null;
}

export const DEFAULT_DESKTOP_CONFIG: LingualDesktopConfig = {
  uiLang: "zh",
  engineProvider: "pi",
  endpoint: "",
  apiKey: "",
  model: "",
  sourceLang: "zh",
  targetLang: "en",
  mode: "english",
  slotPreset: "developer",
  slots: getDefaultSlots("en"),
  directSlots: getDefaultDesktopDirectSlots("en"),
  candidateSlots: getDefaultDesktopCandidateSlots("en"),
  autoSend: true,
  showCapsule: true,
  hotkeyToggleMode: "Alt+Q",
  hotkeySubmit: "Enter",
  hotkeyRewrite: "Alt+E",
  hotkeySpotlight: "Alt+Space",
  capsulePos: null,
};

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
  if (s === "off" || s === "0") return "off";
  if (s === "english" || s === "direct" || s === "2") return "english";
  return DEFAULT_DESKTOP_CONFIG.mode;
}

const SUPPORTED_UI_LANGS = new Set(["en", "zh", "tw", "ja", "ko", "es", "fr", "de", "ru"]);

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

export function discoverPiModelConfig(): { endpoint: string; apiKey: string; model: string } | null {
  try {
    const modelsPath = path.join(os.homedir(), ".pi", "agent", "models.json");
    if (!fs.existsSync(modelsPath)) return null;
    const raw = JSON.parse(fs.readFileSync(modelsPath, "utf8"));
    const providers = raw?.providers;
    if (!providers || typeof providers !== "object") return null;

    for (const p of Object.values(providers) as any[]) {
      if (p && typeof p.baseUrl === "string" && Array.isArray(p.models) && p.models.length > 0) {
        const base = p.baseUrl.replace(/\/+$/, "");
        const endpoint = base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
        const preferred =
          p.models.find((m: any) => /flash|mini|haiku|fast/i.test(m.id)) || p.models[0];
        return {
          endpoint,
          apiKey: p.apiKey || "",
          model: preferred.id,
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

  const piDiscovered = !isTestEnvironment() ? discoverPiModelConfig() : null;

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
    : getDefaultDesktopDirectSlots(effectiveSourceLang);

  const effectiveCandidateSlots = isValidSlotArray(desktopRaw.candidateSlots)
    ? desktopRaw.candidateSlots
    : getDefaultDesktopCandidateSlots(effectiveSourceLang);

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
    endpoint: resolvedEndpoint,
    apiKey: resolvedApiKey,
    model: resolvedModel,
    sourceLang: effectiveSourceLang,
    targetLang: effectiveTargetLang,
    mode: effectiveMode,
    slotPreset: effectiveSlotPreset,
    slots: effectiveSlots,
    directSlots: effectiveDirectSlots,
    candidateSlots: effectiveCandidateSlots,
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
      const sharedKeys = ["sourceLang", "targetLang", "slotPreset", "slots"];
      let hasSharedMutation = false;
      for (const k of sharedKeys) {
        if (k in cfg) {
          existingShared[k] = (cfg as any)[k];
          hasSharedMutation = true;
        }
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
