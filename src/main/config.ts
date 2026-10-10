import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export type CompanionMode = "english" | "original" | "off";

export interface LingualDesktopConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  sourceLang: string;
  targetLang: string;
  mode: CompanionMode;
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

export function loadDesktopConfig(): LingualDesktopConfig {
  const primaryPath = getConfigPath();
  if (fs.existsSync(primaryPath)) {
    try {
      const raw = fs.readFileSync(primaryPath, "utf8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DESKTOP_CONFIG, ...parsed };
    } catch {
      // Fall through to secondary probes
    }
  }

  // Fallback probe: ~/.pi/agent/settings.json and ~/.pi/agent/lingual.json
  const fallbackPaths = [
    path.join(os.homedir(), ".pi", "agent", "settings.json"),
    path.join(os.homedir(), ".pi", "agent", "lingual.json"),
  ];

  for (const p of fallbackPaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw);
        const target = p.endsWith("settings.json") ? (parsed["pi-lingual"] || parsed["lingua"]) : parsed;
        if (!target) continue;

        return {
          ...DEFAULT_DESKTOP_CONFIG,
          endpoint: target.endpoint || DEFAULT_DESKTOP_CONFIG.endpoint,
          apiKey: target.apiKey || DEFAULT_DESKTOP_CONFIG.apiKey,
          model: target.selectedModel || target.model || DEFAULT_DESKTOP_CONFIG.model,
          sourceLang: target.sourceLang || DEFAULT_DESKTOP_CONFIG.sourceLang,
          targetLang: target.targetLang || DEFAULT_DESKTOP_CONFIG.targetLang,
          mode: target.mode || DEFAULT_DESKTOP_CONFIG.mode,
        };
      } catch {
        // Ignore read errors
      }
    }
  }

  return { ...DEFAULT_DESKTOP_CONFIG };
}

export function saveDesktopConfig(cfg: Partial<LingualDesktopConfig>): void {
  const current = loadDesktopConfig();
  const merged = { ...current, ...cfg };
  fs.writeFileSync(getConfigPath(), JSON.stringify(merged, null, 2), "utf8");
}
