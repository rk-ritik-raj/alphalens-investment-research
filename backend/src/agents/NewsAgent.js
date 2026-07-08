const AIService = require("../services/ai.service");
const { NEWS_PROMPT } = require("../prompts/news.prompt");
const { parseJSON } = require("../utils/jsonParser");
const { contextStorage } = require("../utils/context");

/**
 * Agent: NewsAgent
 * 
 * Purpose: Aggregates recent press articles, sentiment-scores headlines, and summarizes events.
 * Inputs: newsData (array) containing raw article structures from provider search.
 * Outputs: parsed sentiment metrics (object) containing Distribution, Sentiment distribution, and topEvents.
 * 
 * Design Selection:
 * Wraps completions through the provider-independent AIService, recording logging context.
 */
async function newsAgent(newsData) {
  const store = contextStorage.getStore() || { timings: {} };
  const start = Date.now();

  const response = await AIService.generate({
    messages: [
      { role: "system", content: NEWS_PROMPT },
      { role: "user", content: JSON.stringify(newsData) }
    ],
    temperature: 0.2,
    maxTokens: 2000,
  });

  const duration = Date.now() - start;
  store.timings = store.timings || {};
  store.timings["NewsAgent"] = duration;
  console.log(`[Observability] [Request: ${store.requestId}] NewsAgent execution completed in ${duration}ms using model: "${store.currentModel}"`);

  try {
    return parseJSON(response);
  } catch (error) {
    console.error("NewsAgent JSON parsing failed:", error);
    return {
      newsSentiment: {
        rating: "Neutral",
        score: 50
      },
      sentimentDistribution: {
        positive: 0,
        negative: 0,
        neutral: 0
      },
      topEvents: []
    };
  }
}

module.exports = {
  newsAgent,
};
