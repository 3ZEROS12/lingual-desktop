import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getDefaultSlots, type SlotConfig } from "pi-lingual/core";

export type CompanionMode = "english" | "original" | "off";
export type SlotPreset = "developer" | "social" | "japanese" | "academic" | "custom";

export interface LingualDesktopConfig {
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
}

export const DEFAULT_DESKTOP_CONFIG: LingualDesktopConfig = {
  endpoint: "http://127.0.0.1:11434/v1/chat/completions",
  apiKey: "ollama",
  model: "qwen2.5:3b",
  sourceLang: "zh",
  targetLang: "en",
  mode: "english",
  slotPreset: "developer",
  slots: getDefaultSlots("zh"),
  autoSend: true,
  showCapsule: true,
  hotkeyToggleMode: "Alt+Q",
  hotkeySubmit: "Ctrl+Enter",
  hotkeyRewrite: "Alt+E",
  hotkeySpotlight: "Alt+Space",
};

export function getConfigDir(): string {
  const dir = path.join(os.homedir(), ".lingual");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), "config.json");
}

function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.NODE_TEST_CONTEXT !== undefined ||
    process.execArgv.some((a) => a.startsWith("--test") || a === "--test") ||
    process.argv.some((a) => a.includes(".test.") || a.includes("test")) ||
    process.env.npm_lifecycle_event === "test"
  );
}

export function getSharedLingualConfigPath(): string {
  return path.join(os.homedir(), ".pi", "agent", "lingual.json");
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

  // 生态单源对齐：优先探测并合并 ~/.pi/agent/lingual.json 中的最新核心伴学状态
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

  const effectiveSourceLang =
    sharedRaw.sourceLang || desktopRaw.sourceLang || DEFAULT_DESKTOP_CONFIG.sourceLang;
  const effectiveTargetLang =
    sharedRaw.targetLang || desktopRaw.targetLang || DEFAULT_DESKTOP_CONFIG.targetLang;
  const effectiveMode =
    (sharedRaw.mode as CompanionMode) || desktopRaw.mode || DEFAULT_DESKTOP_CONFIG.mode;
  const effectiveSlotPreset =
    (sharedRaw.slotPreset as SlotPreset) || desktopRaw.slotPreset || DEFAULT_DESKTOP_CONFIG.slotPreset;

  const effectiveSlots =
    Array.isArray(sharedRaw.slots) && sharedRaw.slots.length > 0
      ? sharedRaw.slots
      : Array.isArray(desktopRaw.slots) && desktopRaw.slots.length > 0
      ? desktopRaw.slots
      : getDefaultSlots(effectiveSourceLang);

  return {
    ...DEFAULT_DESKTOP_CONFIG,
    ...desktopRaw,
    // 共享核心键对齐
    endpoint: sharedRaw.endpoint || desktopRaw.endpoint || DEFAULT_DESKTOP_CONFIG.endpoint,
    apiKey: sharedRaw.apiKey || desktopRaw.apiKey || DEFAULT_DESKTOP_CONFIG.apiKey,
    model: sharedRaw.selectedModel || sharedRaw.model || desktopRaw.model || DEFAULT_DESKTOP_CONFIG.model,
    sourceLang: effectiveSourceLang,
    targetLang: effectiveTargetLang,
    mode: effectiveMode,
    slotPreset: effectiveSlotPreset,
    slots: effectiveSlots,
  };
}

export function saveDesktopConfig(cfg: Partial<LingualDesktopConfig>): void {
  const current = loadDesktopConfig();
  const merged = { ...current, ...cfg };

  // 1. 原子写入桌面专属配置 ~/.lingual/config.json
  const desktopConfigPath = getConfigPath();
  const content = JSON.stringify(merged, null, 2);
  const tmpFile = `${desktopConfigPath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
  try {
    fs.writeFileSync(tmpFile, content, "utf8");
    fs.renameSync(tmpFile, desktopConfigPath);
  } catch {
    try { fs.writeFileSync(desktopConfigPath, content, "utf8"); } catch {}
    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
  }

  // 2. 双轨生态同步：若变更涉及共享伴学核心字段，同步写入 ~/.pi/agent/lingual.json
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

      const sharedKeys = ["sourceLang", "targetLang", "mode", "slotPreset", "slots", "endpoint", "apiKey", "model"];
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
          try { fs.writeFileSync(sharedPath, sharedContent, "utf8"); } catch {}
          try { if (fs.existsSync(sharedTmp)) fs.unlinkSync(sharedTmp); } catch {}
        }
      }
    } catch {}
  }
}
