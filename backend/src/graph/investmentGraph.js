const { StateGraph, START, END } = require("@langchain/langgraph");

const { InvestmentStateAnnotation } = require("../state/investmentState");
const { companyTool } = require("../tools/companyTool");
const { financialTool } = require("../tools/financialTool");
const { newsTool } = require("../tools/newsTool");

const { researchAgent } = require("../agents/ResearchAgent");
const { financialAgent } = require("../agents/FinancialAgent");
const { newsAgent } = require("../agents/NewsAgent");
const { riskAgent } = require("../agents/RiskAgent");
const { decisionAgent } = require("../agents/DecisionAgent");

/**
 * Node: researchNode
 * Responsibility: Resolves symbol, fetches profile, runs Gemini research agent.
 */
async function researchNode(state) {
  console.log(`[Graph Node] Researching: ${state.company}...`);
  try {
    const profileResult = await companyTool(state.company);
    if (!profileResult.success) {
      return {
        errors: [profileResult.isNotFound ? `NOT_FOUND: ${profileResult.message}` : profileResult.message],
      };
    }

    const researchResult = await researchAgent(profileResult.data);
    return {
      symbol: profileResult.symbol,
      companyProfile: profileResult.data,
      research: researchResult,
    };
  } catch (error) {
    console.error("Error in researchNode:", error.message);
    return {
      errors: [`Research Node failed: ${error.message}`],
    };
  }
}

/**
 * Node: financialNode
 * Responsibility: Fetches metrics, runs financial agent.
 */
async function financialNode(state) {
  if (!state.symbol) {
    return {
      errors: ["Financial Node skipped: No ticker symbol resolved."],
    };
  }

  console.log(`[Graph Node] Fetching financials for: ${state.symbol}...`);
  try {
    const metricsResult = await financialTool(state.symbol);
    if (!metricsResult.success) {
      return {
        errors: [metricsResult.message],
      };
    }

    const financialResult = await financialAgent(metricsResult.data);
    return {
      financialData: financialResult,
    };
  } catch (error) {
    console.error("Error in financialNode:", error.message);
    return {
      errors: [`Financial Node failed: ${error.message}`],
    };
  }
}

/**
 * Node: newsNode
 * Responsibility: Fetches news articles, runs news agent.
 */
async function newsNode(state) {
  if (!state.symbol) {
    return {
      errors: ["News Node skipped: No ticker symbol resolved."],
    };
  }

  console.log(`[Graph Node] Fetching news for: ${state.symbol}...`);
  try {
    const newsResult = await newsTool(state.symbol);
    if (!newsResult.success) {
      return {
        errors: [newsResult.message],
      };
    }

    const processedNews = await newsAgent(newsResult.data);
    return {
      news: processedNews,
    };
  } catch (error) {
    console.error("Error in newsNode:", error.message);
    return {
      errors: [`News Node failed: ${error.message}`],
    };
  }
}

/**
 * Node: riskNode
 * Responsibility: Synthesizes risk matrices based on current compiled state elements.
 */
async function riskNode(state) {
  const hasCriticalErrors = state.errors && state.errors.some(err => 
    err.includes("No profile found") || err.includes("ticker symbol resolved") || err.includes("NOT_FOUND:")
  );

  if (hasCriticalErrors) {
    return {
      riskAnalysis: {
        riskScore: 0,
        riskRating: "Unknown",
        reasoning: "Skipped risk analysis due to profile resolution failures.",
        categories: {}
      }
    };
  }

  console.log(`[Graph Node] Analyzing risks for: ${state.symbol || state.company}...`);
  try {
    const riskResult = await riskAgent(state);
    return {
      riskAnalysis: riskResult,
    };
  } catch (error) {
    console.error("Error in riskNode:", error.message);
    return {
      riskAnalysis: {
        riskScore: 5,
        riskRating: "Medium",
        reasoning: `Risk Node failed: ${error.message}`,
        categories: {}
      },
      errors: [`Risk Node failed: ${error.message}`],
    };
  }
}

/**
 * Node: decisionNode
 * Responsibility: Compiles final BUY/PASS recommendation.
 */
async function decisionNode(state) {
  const hasCriticalErrors = state.errors && state.errors.some(err => 
    err.includes("No profile found") || err.includes("ticker symbol resolved") || err.includes("NOT_FOUND:")
  );

  if (hasCriticalErrors) {
    return {
      decision: {
        recommendation: "PASS",
        confidence: 0,
        pros: [],
        cons: ["No company profile or ticker resolved"],
        reasoning: "Unable to reach decision due to critical upstream errors.",
        investmentSummary: "Execution halted."
      }
    };
  }

  console.log(`[Graph Node] Synthesizing investment decision for: ${state.symbol || state.company}...`);
  try {
    const decisionResult = await decisionAgent(state);
    return {
      decision: decisionResult,
    };
  } catch (error) {
    console.error("Error in decisionNode:", error.message);
    return {
      decision: {
        recommendation: "PASS",
        confidence: 0,
        pros: [],
        cons: ["Decision agent error"],
        reasoning: `Decision agent failed: ${error.message}`,
        investmentSummary: "Analysis failed during final synthesis."
      },
      errors: [`Decision Node failed: ${error.message}`],
    };
  }
}

/**
 * Builds and compiles the multi-agent StateGraph flow.
 */
function buildInvestmentGraph() {
  const graph = new StateGraph(InvestmentStateAnnotation);

  // Register nodes
  graph.addNode("researchNode", researchNode);
  graph.addNode("financialNode", financialNode);
  graph.addNode("newsNode", newsNode);
  graph.addNode("riskNode", riskNode);
  graph.addNode("decisionNode", decisionNode);

  // Set up execution paths
  graph.addEdge(START, "researchNode");
  graph.addEdge("researchNode", "financialNode");
  graph.addEdge("researchNode", "newsNode");
  graph.addEdge("financialNode", "riskNode");
  graph.addEdge("newsNode", "riskNode");
  graph.addEdge("riskNode", "decisionNode");
  graph.addEdge("decisionNode", END);

  return graph.compile();
}

module.exports = {
  buildInvestmentGraph,
};
