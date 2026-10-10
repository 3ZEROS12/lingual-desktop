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
  const isOfflineOrFailed = didFail() || (!res.shieldBypassed && !res.cached && res.spoken === text && res.written === text);

  return {
    ...res,
    isOfflineOrFailed,
  };
}
