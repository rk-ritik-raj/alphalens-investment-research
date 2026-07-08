const axios = require("axios");
const https = require("https");
const { contextStorage } = require("../utils/context");
const { parseJSON } = require("../utils/jsonParser");

// Provider metadata constants
const PROVIDER_NAME = "OpenRouter";
const FALLBACK_MODELS = [
  process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-32b:free"
];

let cachedFreeModels = null;
let lastFetchTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

// Reuse Axios client with Keep-Alive enabled
const openRouterClient = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "HTTP-Referer": "https://github.com/AlphaLens-AI",
    "X-Title": "AlphaLens AI",
  },
  httpsAgent: new https.Agent({ keepAlive: true }),
});

/**
 * Service Class: AIService
 * 
 * Purpose: Centralized interface for OpenRouter completions.
 * Design: Decoupled architecture with model fallbacks, retry parameters, and observability.
 * Inputs: messages (array), temperature (number), maxTokens (number).
 * Outputs: parsed completion content (string).
 * 
 * Why this exists:
 * Wraps external LLM communications, isolating agents from provider-specific REST details.
 * Implements resilient retry states and logs timings via Node AsyncLocalStorage context.
 */
class AIService {
  static async getFallbackModels() {
    const now = Date.now();
    if (cachedFreeModels && (now - lastFetchTime < CACHE_TTL)) {
      return cachedFreeModels;
    }

    try {
      console.log("[AIService] Fetching fresh list of free models from OpenRouter...");
      const response = await openRouterClient.get("/models");
      const models = response.data?.data || [];
      const freeModels = models
        .filter(m => {
          const promptPrice = parseFloat(m.pricing?.prompt);
          const completionPrice = parseFloat(m.pricing?.completion);
          return promptPrice === 0 && completionPrice === 0;
        })
        .map(m => m.id);

      if (freeModels.length > 0) {
        const merged = [...FALLBACK_MODELS];
        for (const m of freeModels) {
          if (!merged.includes(m)) {
            merged.push(m);
          }
        }
        cachedFreeModels = merged;
        lastFetchTime = now;
        return merged;
      }
    } catch (err) {
      console.warn("[AIService] Failed to fetch free models from OpenRouter, using default fallbacks:", err.message);
    }
    return FALLBACK_MODELS;
  }

  static async generate({ messages, temperature = 0.2, maxTokens, attempt = 1 }) {
    const store = contextStorage.getStore() || { requestId: "system", timings: {}, modelChain: [] };
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not defined.");
    }

    console.log(`[AIService] API key starts with: "${apiKey.substring(0, 10)}..." (length: ${apiKey.length})`);

    // Format role structures
    const formattedMessages = messages.map(msg => {
      let role = "user";
      if (typeof msg === "string") {
        return { role, content: msg };
      }
      if (msg._getType) {
        const type = msg._getType();
        if (type === "system") role = "system";
        else if (type === "ai") role = "assistant";
      } else if (msg.role) {
        role = msg.role;
      }
      return {
        role,
        content: msg.content || ""
      };
    });

    let lastError = null;
    const activeFallbackModels = await AIService.getFallbackModels();

    for (const model of activeFallbackModels) {
      const completionStart = Date.now();
      store.modelChain = store.modelChain || [];
      if (!store.modelChain.includes(model)) {
        store.modelChain.push(model);
      }
      store.currentModel = model;
      store.currentProvider = PROVIDER_NAME;
      store.retryCount = (store.retryCount || 0) + (attempt > 1 ? 1 : 0);

      console.log(`[Request: ${store.requestId}] [AIService] Invoking model "${model}" (Attempt ${attempt}, Temp ${temperature})`);

      try {
        const response = await openRouterClient.post(
          "/chat/completions",
          {
            model,
            messages: formattedMessages,
            temperature,
            max_tokens: maxTokens || 4000,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            }
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error(`Empty response content returned by model "${model}".`);
        }

        // Validate JSON matches schema instructions if expected
        const expectsJSON = formattedMessages.some(m =>
          m.content.toLowerCase().includes("json") ||
          m.content.toLowerCase().includes("must be a json object")
        );

        if (expectsJSON) {
          try {
            parseJSON(content);
          } catch (jsonErr) {
            console.warn(`[Request: ${store.requestId}] [AIService] JSON validation failed for model "${model}": ${jsonErr.message}`);
            throw { name: "JSONValidationError", message: "Malformed JSON response from model completion", content };
          }
        }

        // Observability timings update
        const completionTime = Date.now() - completionStart;
        store.timings = store.timings || {};
        store.timings[model] = (store.timings[model] || 0) + completionTime;

        return content;
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const responseData = err.response?.data;
        console.warn(`[Request: ${store.requestId}] [AIService] Model completed with exception: ${err.message || err}`, responseData ? JSON.stringify(responseData) : "");

        // Fail fast on authentication or authorization issues (account-level configuration errors)
        if (status === 401 || status === 403) {
          throw new Error(`OpenRouter client configuration error (HTTP ${status}): ${JSON.stringify(responseData || err.message)}`);
        }
      }
    }

    // Determine if the error is retryable
    const isRetryable = lastError.name === "JSONValidationError" ||
                        (lastError.response && [408, 429, 500, 502, 503, 504].includes(lastError.response.status)) ||
                        lastError.message.includes("timeout") || lastError.message.includes("Network Error");

    if (isRetryable && attempt < 2) {
      const delayMs = Math.pow(2, attempt) * 1000;
      console.log(`[Request: ${store.requestId}] [AIService] Retryable error occurred. Scheduling backoff retry in ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs));
      return AIService.generate({ messages, temperature, maxTokens, attempt: attempt + 1 });
    }

    throw new Error(`OpenRouter invocation failed after fallback chain: ${lastError.message || lastError}`);
  }

  static async generateContent(prompt) {
    return AIService.generate({
      messages: [{ role: "user", content: prompt }]
    });
  }
}

module.exports = AIService;
