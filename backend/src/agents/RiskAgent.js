const AIService = require("../services/ai.service");
const { RISK_PROMPT } = require("../prompts/risk.prompt");
const { parseJSON } = require("../utils/jsonParser");
const { contextStorage } = require("../utils/context");

/**
 * Agent: RiskAgent
 * 
 * Purpose: Evaluates company risk vectors across regulatory, technological, and market metrics.
 * Inputs: accumulatedState (object) containing profile, research data, metrics, and news.
 * Outputs: parsed risk scoring report (object) containing riskScore, riskRating, and reasoning.
 * 
 * Design Selection:
 * Wraps completions through the provider-independent AIService, recording logging context.
 */
async function riskAgent(accumulatedState) {
  const store = contextStorage.getStore() || { timings: {} };
  const start = Date.now();

  const inputPayload = {
    profile: accumulatedState.companyProfile || {},
    research: accumulatedState.research || {},
    financials: accumulatedState.financialData || {},
    news: accumulatedState.news || []
  };

  const response = await AIService.generate({
    messages: [
      { role: "system", content: RISK_PROMPT },
      { role: "user", content: JSON.stringify(inputPayload) }
    ],
    temperature: 0.2,
    maxTokens: 2000,
  });

  const duration = Date.now() - start;
  store.timings = store.timings || {};
  store.timings["RiskAgent"] = duration;
  console.log(`[Observability] [Request: ${store.requestId}] RiskAgent execution completed in ${duration}ms using model: "${store.currentModel}"`);

  try {
    return parseJSON(response);
  } catch (error) {
    console.error("RiskAgent JSON parsing failed:", error);
    return {
      riskScore: 5,
      riskRating: "Medium",
      reasoning: "Failed to evaluate risks: " + response,
      categories: {
        competition: { score: "5", details: "N/A" },
        debt: { score: "5", details: "N/A" },
        industry: { score: "5", details: "N/A" },
        technology: { score: "5", details: "N/A" },
        market: { score: "5", details: "N/A" },
        regulatory: { score: "5", details: "N/A" }
      }
    };
  }
}

module.exports = {
  riskAgent,
};
