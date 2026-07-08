const AIService = require("../services/ai.service");
const { DECISION_PROMPT } = require("../prompts/decision.prompt");
const { parseJSON } = require("../utils/jsonParser");
const { contextStorage } = require("../utils/context");

/**
 * Agent: DecisionAgent
 * 
 * Purpose: Aggregates all compiled research, financial, news, and risk dimensions to output a final rating.
 * Inputs: accumulatedState (object) containing profile, research data, metrics, news, and risks.
 * Outputs: parsed synthesis report (object) containing recommendation, confidence, pros, cons, reasoning.
 * 
 * Design Selection:
 * Decoupled from ChatGoogleGenerativeAI models. Logs execution duration metrics dynamically.
 */
async function decisionAgent(accumulatedState) {
  const store = contextStorage.getStore() || { timings: {} };
  const start = Date.now();

  const inputPayload = {
    profile: accumulatedState.companyProfile || {},
    research: accumulatedState.research || {},
    financials: accumulatedState.financialData || {},
    news: accumulatedState.news || [],
    risks: accumulatedState.riskAnalysis || {}
  };

  const response = await AIService.generate({
    messages: [
      { role: "system", content: DECISION_PROMPT },
      { role: "user", content: JSON.stringify(inputPayload) }
    ],
    temperature: 0.2,
    maxTokens: 2000,
  });

  const duration = Date.now() - start;
  store.timings = store.timings || {};
  store.timings["DecisionAgent"] = duration;
  console.log(`[Observability] [Request: ${store.requestId}] DecisionAgent execution completed in ${duration}ms using model: "${store.currentModel}"`);

  try {
    return parseJSON(response);
  } catch (error) {
    console.error("DecisionAgent JSON parsing failed:", error);
    return {
      recommendation: "PASS",
      confidence: 50,
      pros: [],
      cons: [],
      reasoning: "Decision agent failed to parse final recommendation: " + response,
      investmentSummary: "Analysis could not be concluded."
    };
  }
}

module.exports = {
  decisionAgent,
};
