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
 * 解决新用户未配置 API Key 或本地模型离线时直接瘫痪的根本痛点。
 * 0 配置、0 门槛、免任何 Key，首秒开箱即可打字翻译！
 */
export async function fetchZeroKeyTranslation(
  text: string,
  sourceLang = "zh",
  targetLang = "en"
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    const sl = sourceLang === "zh" || sourceLang === "tw" ? "zh-CN" : sourceLang;
    const tl = targetLang === "zh" || targetLang === "tw" ? "zh-CN" : targetLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(trimmed)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return null;
    const json = (await res.json()) as any;
    if (Array.isArray(json) && Array.isArray(json[0])) {
      const translated = json[0]
        .map((item: any) => (Array.isArray(item) ? item[0] : ""))
        .filter(Boolean)
        .join("");
      return translated && translated.trim() ? translated.trim() : null;
    }
    return null;
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
    const apiKey = config.apiKey || "ollama";
    const model = config.model || "qwen2.5:3b";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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
          temperature: 0.2,
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
