import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getDefaultSlots, type SlotConfig } from "pi-lingual/core";

export type CompanionMode = "english" | "original" | "off";
export type SlotPreset = "developer" | "social" | "japanese" | "academic" | "custom";
export type EngineProviderMode = "pi" | "free" | "custom";

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
      desktopRaw = JSON.parse(fs.readFileSync(primaryPath, "utf8"));
    } catch {
      desktopRaw = {};
    }
  }

  let sharedRaw: Record<string, any> = {};
  const sharedPath = getSharedLingualConfigPath();
  if (!isTestEnvironment() && fs.existsSync(sharedPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
      sharedRaw = parsed["pi-lingual"] || parsed;
    } catch {
      sharedRaw = {};
    }
  }

  const piDiscovered = !isTestEnvironment() ? discoverPiModelConfig() : null;

  // Desktop config is primary; shared config is fallback for initial bootstrap
  const effectiveUiLang = desktopRaw.uiLang || DEFAULT_DESKTOP_CONFIG.uiLang;
  const effectiveSourceLang =
    desktopRaw.sourceLang || sharedRaw.sourceLang || DEFAULT_DESKTOP_CONFIG.sourceLang;
  const effectiveTargetLang =
    desktopRaw.targetLang || sharedRaw.targetLang || DEFAULT_DESKTOP_CONFIG.targetLang;
  const effectiveMode =
    (desktopRaw.mode as CompanionMode) ||
    (sharedRaw.mode as CompanionMode) ||
    DEFAULT_DESKTOP_CONFIG.mode;
  const effectiveSlotPreset =
    (desktopRaw.slotPreset as SlotPreset) ||
    (sharedRaw.slotPreset as SlotPreset) ||
    DEFAULT_DESKTOP_CONFIG.slotPreset;

  const effectiveSlots =
    Array.isArray(desktopRaw.slots) && desktopRaw.slots.length > 0
      ? desktopRaw.slots
      : Array.isArray(sharedRaw.slots) && sharedRaw.slots.length > 0
      ? sharedRaw.slots
      : getDefaultSlots("en");

  const rawSubmitKey = desktopRaw.hotkeySubmit || DEFAULT_DESKTOP_CONFIG.hotkeySubmit;
  const safeHotkeySubmit =
    rawSubmitKey.toLowerCase() === "ctrl+enter" ? "Enter" : rawSubmitKey;

  const engineProvider: EngineProviderMode =
    desktopRaw.engineProvider ||
    (piDiscovered ? "pi" : "free");

  const customEndpoint =
    desktopRaw.endpoint && !desktopRaw.endpoint.includes("11434") && !desktopRaw.endpoint.includes("127.0.0.1:0")
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

      const sharedKeys = ["sourceLang", "targetLang", "mode", "slotPreset", "slots"];
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
