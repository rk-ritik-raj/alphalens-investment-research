const AIService = require("../services/ai.service");
const { RESEARCH_PROMPT } = require("../prompts/research.prompt");
const { parseJSON } = require("../utils/jsonParser");
const { contextStorage } = require("../utils/context");

/**
 * Agent: ResearchAgent
 * 
 * Purpose: Analyzes company profile parameters to summarize operations, segmentations, and strategies.
 * Inputs: companyProfile (object) containing exchange details, industry, and capitalization.
 * Outputs: parsed research report (object) containing summary, businessModel, strengths, weaknesses.
 * 
 * Design Selection:
 * Completely decoupled from specific LLM libraries or LangChain SDK chat classes.
 * Measures agent-specific latency metrics, logging them to the context store.
 */
async function researchAgent(companyData) {
  const store = contextStorage.getStore() || { timings: {} };
  const start = Date.now();

  const response = await AIService.generate({
    messages: [
      { role: "system", content: RESEARCH_PROMPT },
      { role: "user", content: JSON.stringify(companyData) }
    ],
    temperature: 0.2,
    maxTokens: 2000,
  });

  const duration = Date.now() - start;
  store.timings = store.timings || {};
  store.timings["ResearchAgent"] = duration;
  console.log(`[Observability] [Request: ${store.requestId}] ResearchAgent execution completed in ${duration}ms using model: "${store.currentModel}"`);

  try {
    return parseJSON(response);
  } catch (error) {
    console.error("ResearchAgent JSON parsing failed:", error);
    return {
      summary: response || "Failed to analyze.",
      industry: "Unknown",
      businessModel: "Unknown",
      strengths: [],
      weaknesses: []
    };
  }
}

module.exports = {
  researchAgent,
};
