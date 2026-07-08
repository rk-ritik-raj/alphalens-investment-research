const { runInvestmentWorkflow } = require("../services/graph.service");
const db = require("../utils/db");
const { contextStorage } = require("../utils/context");
const { randomUUID } = require("crypto");

/**
 * Controller: researchCompany
 * 
 * Purpose: Entrypoint for the investment graph execution.
 * Inputs: req.body.company (string).
 * Outputs: JSON response containing saved analysis record or formatted error code.
 * 
 * Design Selection:
 * Context Isolation: Uses Node.js AsyncLocalStorage to isolate logs and latency metrics per request.
 * Observability: Injects model parameters and execution timing into the database metadata schema.
 */
const researchCompany = async (req, res) => {
  const requestId = randomUUID();
  const startTime = Date.now();

  // Run the request inside the AsyncLocalStorage context
  await contextStorage.run({ requestId, startTime, timings: {}, modelChain: [] }, async () => {
    try {
      const { company } = req.body;
      if (!company) {
        console.log(`[Request: ${requestId}] ❌ Company name missing from request.`);
        return res.status(400).json({
          success: false,
          message: "Company name is required.",
        });
      }

      console.log(`[Request: ${requestId}] 🚀 Starting multi-agent workflow for: "${company}"`);

      const initialState = {
        company,
        symbol: "",
        companyProfile: {},
        financialData: {},
        news: [],
        research: {},
        riskAnalysis: {},
        decision: {},
        errors: [],
        meta: {},
      };

      const finalState = await runInvestmentWorkflow(initialState);

      // Company not found
      const isNotFound = finalState.errors && finalState.errors.some((err) => err.includes("NOT_FOUND:"));
      if (isNotFound) {
        console.log(`[Request: ${requestId}] ❌ Company could not be resolved.`);
        const rawError = finalState.errors.find((err) => err.includes("NOT_FOUND:"));
        const cleanMessage = rawError.replace("NOT_FOUND: ", "");
        return res.status(404).json({
          success: false,
          message: cleanMessage,
        });
      }

      // Critical workflow failure
      const hasCriticalError = finalState.errors && finalState.errors.some(
        (err) => err.includes("No profile found") || err.includes("ticker symbol resolved")
      );

      if (hasCriticalError) {
        console.log(`[Request: ${requestId}] ❌ Critical workflow error detected.`);
        return res.status(400).json({
          success: false,
          message: finalState.errors[0] || "Failed to resolve company details.",
        });
      }

      // Append observability metadata to the final state before saving
      const store = contextStorage.getStore();
      const endTime = Date.now();
      const duration = endTime - store.startTime;

      finalState.meta = {
        provider: store.currentProvider || "OpenRouter",
        model: store.currentModel || "deepseek/deepseek-chat-v3-0324:free",
        workflowDuration: duration,
        timestamp: new Date().toISOString(),
        timings: store.timings || {},
        requestId: store.requestId,
        retryCount: store.retryCount || 0
      };

      const raTime = store.timings["ResearchAgent"] ? (store.timings["ResearchAgent"] / 1000).toFixed(1) + "s" : "N/A";
      const faTime = store.timings["FinancialAgent"] ? (store.timings["FinancialAgent"] / 1000).toFixed(1) + "s" : "N/A";
      const naTime = store.timings["NewsAgent"] ? (store.timings["NewsAgent"] / 1000).toFixed(1) + "s" : "N/A";
      const riTime = store.timings["RiskAgent"] ? (store.timings["RiskAgent"] / 1000).toFixed(1) + "s" : "N/A";
      const deTime = store.timings["DecisionAgent"] ? (store.timings["DecisionAgent"] / 1000).toFixed(1) + "s" : "N/A";
      const totalTime = (duration / 1000).toFixed(1) + "s";

      console.log(`\n=== EXECUTION TIMINGS ===`);
      console.log(`ResearchAgent: ${raTime}`);
      console.log(`FinancialAgent: ${faTime}`);
      console.log(`NewsAgent: ${naTime}`);
      console.log(`RiskAgent: ${riTime}`);
      console.log(`DecisionAgent: ${deTime}`);
      console.log(`\nTotal Execution Time: ${totalTime}\n=========================\n`);

      console.log(`[Request: ${requestId}] ✅ Multi-agent workflow completed successfully in ${duration}ms.`);
      console.dir(finalState.meta);

      const savedReport = db.saveReport(finalState);
      return res.json({
        success: true,
        data: savedReport,
      });

    } catch (error) {
      console.log(`[Request: ${requestId}] ❌ RESEARCH CONTROLLER CRASHED:`, error.message);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });
};

module.exports = {
  researchCompany,
};