const AIService = require("../services/ai.service");
const { FINANCIAL_PROMPT } = require("../prompts/financial.prompt");
const { parseJSON } = require("../utils/jsonParser");
const { contextStorage } = require("../utils/context");

/**
 * Agent: FinancialAgent
 * 
 * Purpose: Formulates checks, ratios, and rates balance sheets / income statements.
 * Inputs: metricsData (object) containing raw margins, growth, and leverage values.
 * Outputs: parsed financial health summaries (object) containing rating, reasoning.
 * 
 * Design Selection:
 * Decoupled from ChatGoogleGenerativeAI models. Logs execution duration metrics dynamically.
 */
async function financialAgent(metricsData) {
  const store = contextStorage.getStore() || { timings: {} };
  const start = Date.now();

  const response = await AIService.generate({
    messages: [
      { role: "system", content: FINANCIAL_PROMPT },
      { role: "user", content: JSON.stringify(metricsData) }
    ],
    temperature: 0.2,
    maxTokens: 2000,
  });

  const duration = Date.now() - start;
  store.timings = store.timings || {};
  store.timings["FinancialAgent"] = duration;
  console.log(`[Observability] [Request: ${store.requestId}] FinancialAgent execution completed in ${duration}ms using model: "${store.currentModel}"`);

  try {
    return parseJSON(response);
  } catch (error) {
    console.error("FinancialAgent JSON parsing failed:", error);
    return {
      metrics: {
        marketCap: "N/A",
        revenue: "N/A",
        profit: "N/A",
        cashFlow: "N/A",
        debt: "N/A",
        growth: "N/A"
      },
      valuationRatios: {
        peRatio: "N/A",
        eps: "N/A",
        profitMargin: "N/A",
        debtEquityRatio: "N/A"
      },
      financialHealth: {
        rating: "Unknown",
        reasoning: "Failed to parse metrics: " + response
      }
    };
  }
}

module.exports = {
  financialAgent,
};
