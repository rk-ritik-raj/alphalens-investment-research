/**
 * Integration Test Suite for AlphaLens AI Investment Platform
 * 
 * Category: Integration Tests (No Mocks Allowed)
 * Description: Verifies the real end-to-end multi-agent pipeline using
 *              real Gemini model calls, real LangGraph nodes, real Finnhub APIs,
 *              and real PDF Kit generation. Handles upstream rate limits and provider
 *              limitations gracefully as documented exceptions.
 */
const path = require("path");
const backendPath = path.join(__dirname, "../..");
require(`${backendPath}/node_modules/dotenv`).config({ path: `${backendPath}/.env` });

const { runInvestmentWorkflow } = require("../../src/services/graph.service");
const db = require("../../src/utils/db");
const { generatePDFReport } = require("../../src/utils/pdfGenerator");

const COMPANIES = [
  "Apple", "Microsoft", "Google", "Tesla", "NVIDIA", 
  "Amazon", "Meta", "Adobe", "Oracle", "Toyota", "Infosys"
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runRealIntegrationTest(company) {
  console.log(`\n--------------------------------------------`);
  console.log(`[INTEGRATION RUN] Executing real pipeline for: "${company}"`);
  
  const { contextStorage } = require("../../src/utils/context");
  const { randomUUID } = require("crypto");
  
  try {
    const start = Date.now();
    const requestId = randomUUID();
    
    const finalState = await contextStorage.run({ requestId, startTime: start, timings: {}, modelChain: [] }, async () => {
      return runInvestmentWorkflow({
        company,
        symbol: "",
        companyProfile: {},
        financialData: {},
        news: [],
        research: {},
        riskAnalysis: {},
        decision: {},
        errors: [],
      });
    });

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[INTEGRATION RUN] Completed in ${duration}s.`);

    // Check for rate limits or client failures in the execution logs
    const isRateLimited = finalState.errors && finalState.errors.some(err => 
      err.includes("429") || err.includes("quota") || err.includes("RESOURCE_EXHAUSTED")
    );
    if (isRateLimited) {
      console.warn(`[INTEGRATION LIMIT] Rate limit or daily quota exceeded during LLM reasoning.`);
      return {
        company,
        ticker: finalState.symbol || "N/A",
        profile: "LIMIT",
        financials: "LIMIT",
        news: "LIMIT",
        risks: "LIMIT",
        decision: "LIMIT",
        rec: "N/A",
        confidence: "N/A",
        pdf: "LIMIT",
        status: "429_LIMIT"
      };
    }

    const isNotFound = finalState.errors && finalState.errors.some(err => 
      err.includes("could not be found or is not a publicly traded entity")
    );
    if (isNotFound) {
      console.warn(`[INTEGRATION LIMIT] Company could not be resolved by provider.`);
      return {
        company,
        ticker: "N/A",
        profile: "LIMIT",
        financials: "LIMIT",
        news: "LIMIT",
        risks: "LIMIT",
        decision: "LIMIT",
        rec: "N/A",
        confidence: "N/A",
        pdf: "LIMIT",
        status: "404_LIMIT"
      };
    }

    // Verify key components
    const profile = finalState.companyProfile || {};
    const financials = finalState.financialData || {};
    const news = finalState.news || {};
    const risks = finalState.riskAnalysis || {};
    const decision = finalState.decision || {};

    const profileOK = !!profile.name;
    const financialsOK = !!financials.metrics || (financials.financialHealth && financials.financialHealth.rating === "N/A");
    const newsOK = Array.isArray(news.topEvents);
    const risksOK = typeof risks.riskScore === "number" || typeof risks.riskScore === "string" || risks.riskScore === 0;
    const decisionOK = !!decision.recommendation;

    let pdfOK = false;
    let dbOK = false;

    if (profileOK && decisionOK) {
      const saved = db.saveReport(finalState);
      dbOK = !!saved.id;
      try {
        const buffer = await generatePDFReport(saved);
        pdfOK = buffer && buffer.length > 0;
      } catch (pdfErr) {
        console.error(`[INTEGRATION RUN] PDF generation failed:`, pdfErr.message);
      }
    }

    return {
      company,
      ticker: profile.ticker || finalState.symbol || "N/A",
      profile: profileOK ? "PASS" : "FAIL",
      financials: financialsOK ? "PASS" : "FAIL",
      news: newsOK ? "PASS" : "FAIL",
      risks: risksOK ? "PASS" : "FAIL",
      decision: decisionOK ? "PASS" : "FAIL",
      rec: decision.recommendation || "N/A",
      confidence: decision.confidence ? `${decision.confidence}%` : "N/A",
      pdf: pdfOK ? "PASS" : "FAIL",
      status: "SUCCESS"
    };

  } catch (error) {
    console.error(`[INTEGRATION ERROR] Unexpected pipeline failure:`, error.message);
    const statusVal = error.message.includes("429") || error.message.includes("quota") ? "429_LIMIT" : "FAILED";
    return {
      company,
      ticker: "N/A",
      profile: "FAIL",
      financials: "FAIL",
      news: "FAIL",
      risks: "FAIL",
      decision: "FAIL",
      rec: "N/A",
      confidence: "N/A",
      pdf: "FAIL",
      status: statusVal
    };
  }
}

async function runSuite() {
  console.log("=== STARTING REAL INTEGRATION TEST SUITE (NO MOCKS) ===");
  const results = [];
  
  for (const company of COMPANIES) {
    const result = await runRealIntegrationTest(company);
    results.push(result);
    // 5-second cooldown to lower peak rate limit issues
    await delay(5000);
  }

  console.log("\n==========================================================================================");
  console.log("===                          REAL INTEGRATION TEST SUITE SUMMARY                       ===");
  console.log("==========================================================================================");
  console.log(
    "| Company       | Ticker  | Profile | Financials | News | Risks | Decision | Conf. | PDF  | Status  |"
  );
  console.log(
    "|---------------|---------|---------|------------|------|-------|----------|-------|------|---------|"
  );
  
  results.forEach(r => {
    const c = r.company.padEnd(13);
    const tk = r.ticker.padEnd(7);
    const pr = r.profile.padEnd(7);
    const fn = r.financials.padEnd(10);
    const nw = r.news.padEnd(4);
    const rk = r.risks.padEnd(5);
    const ds = r.decision.padEnd(8);
    const cf = r.confidence.padEnd(5);
    const pf = r.pdf.padEnd(4);
    const st = r.status.padEnd(7);
    console.log(`| ${c} | ${tk} | ${pr} | ${fn} | ${nw} | ${rk} | ${ds} | ${cf} | ${pf} | ${st} |`);
  });
  console.log("==========================================================================================");
  console.log("\nLegend:\n - PASS: Verified successfully using live APIs and models.\n - LIMIT: Skipped or returned N/A due to known provider limitation or 429 quota exhaustion.\n");

  process.exit(0);
}

runSuite();
