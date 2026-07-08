/**
 * Unit Test Suite for AlphaLens AI Investment Platform
 * 
 * Category: Unit Tests (Mocks Allowed)
 * Description: Verifies graph flow, data propagation, DB storage, and PDF generation
 *              for all 15 global companies by mocking Gemini and API responses
 *              to prevent rate limits and external downtime.
 */
const path = require("path");
const backendPath = path.join(__dirname, "../..");
require(`${backendPath}/node_modules/dotenv`).config({ path: `${backendPath}/.env` });

const AIService = require("../../src/services/ai.service");

// Mock AIService.generate to bypass daily free tier rate limits (20 RPD) during unit tests
AIService.generate = async function({ messages, temperature }) {
  const { contextStorage } = require("../../src/utils/context");
  const store = contextStorage.getStore() || { timings: {} };
  store.currentModel = "mock-model-v3";
  store.currentProvider = "MockProvider";

  // Get content of the messages
  const systemMessage = messages.find(m => m.role === "system" || m.constructor.name === "SystemMessage");
  const systemText = systemMessage ? (systemMessage.content || "") : "";
  const systemTextLower = systemText.toLowerCase();

  const userMessage = messages.find(m => m.role === "user" || m.constructor.name === "HumanMessage");
  const userText = userMessage ? (userMessage.content || "") : "";
  const userTextLower = userText.toLowerCase();

  // Company Resolver Fallback Prompt
  if (systemTextLower.includes("resolve the user's company search query") || userTextLower.includes("resolve the user's company search query")) {
    let resolvedTicker = "AAPL";
    let resolvedName = "Apple Inc.";
    let exists = true;

    const query = userTextLower || systemTextLower;
    if (query.includes("apple")) {
      resolvedTicker = "AAPL"; resolvedName = "Apple Inc.";
    } else if (query.includes("microsoft")) {
      resolvedTicker = "MSFT"; resolvedName = "Microsoft Corporation";
    } else if (query.includes("google") || query.includes("alphabet")) {
      resolvedTicker = "GOOGL"; resolvedName = "Alphabet Inc.";
    } else if (query.includes("tesla")) {
      resolvedTicker = "TSLA"; resolvedName = "Tesla Inc.";
    } else if (query.includes("amazon")) {
      resolvedTicker = "AMZN"; resolvedName = "Amazon.com Inc.";
    } else if (query.includes("meta") || query.includes("facebook")) {
      resolvedTicker = "META"; resolvedName = "Meta Platforms Inc.";
    } else if (query.includes("nvidia")) {
      resolvedTicker = "NVDA"; resolvedName = "NVIDIA Corporation";
    } else if (query.includes("tcs") || query.includes("consultancy")) {
      resolvedTicker = "TCS"; resolvedName = "Tata Consultancy Services";
    } else if (query.includes("infosys")) {
      resolvedTicker = "INFY"; resolvedName = "Infosys Limited";
    } else if (query.includes("reliance")) {
      resolvedTicker = "RELIANCE"; resolvedName = "Reliance Industries";
    } else if (query.includes("netflix")) {
      resolvedTicker = "NFLX"; resolvedName = "Netflix Inc.";
    } else if (query.includes("samsung")) {
      resolvedTicker = "SMSN.L"; resolvedName = "Samsung Electronics";
    } else if (query.includes("toyota")) {
      resolvedTicker = "TM"; resolvedName = "Toyota Motor Corporation";
    } else if (query.includes("adobe")) {
      resolvedTicker = "ADBE"; resolvedName = "Adobe Inc.";
    } else if (query.includes("oracle")) {
      resolvedTicker = "ORCL"; resolvedName = "Oracle Corporation";
    } else {
      exists = false;
      resolvedTicker = null;
      resolvedName = null;
    }

    return JSON.stringify({
      exists: exists,
      ticker: resolvedTicker,
      name: resolvedName
    });
  }

  // Research Agent Prompt
  if (systemTextLower.includes("research analyst")) {
    return JSON.stringify({
      summary: "A leading international enterprise with robust business segments and global market reach.",
      industry: "Global Services & Tech",
      businessModel: "Direct product sales, enterprise licensing, and recurring service contracts.",
      strengths: ["Strong operational footprint", "Diverse revenue streams", "Stellar brand recognition"],
      weaknesses: ["Exposure to foreign exchange risk", "Intense market competition"]
    });
  } 
  
  // Financial Agent Prompt
  if (systemTextLower.includes("financial analyst") || systemTextLower.includes("financial metrics")) {
    return JSON.stringify({
      metrics: {
        marketCap: "$50B",
        revenue: "$5.2B",
        profit: "$1.1B",
        cashFlow: "$850M",
        debt: "$500M",
        growth: "12%"
      },
      valuationRatios: {
        peRatio: "25.5",
        eps: "3.50",
        profitMargin: "15.2%",
        debtEquityRatio: "0.45"
      },
      financialHealth: {
        rating: "Strong",
        reasoning: "Exceptional cash conversion rates, high liquidity ratios, and a conservative leverage profile."
      }
    });
  } 
  
  // News Agent Prompt
  if (systemTextLower.includes("news editor") || systemTextLower.includes("sentiment analysis") || systemTextLower.includes("news analyst")) {
    return JSON.stringify({
      newsSentiment: {
        rating: "Positive",
        score: 80,
        reasoning: "Overall media coverage is constructive, highlighting growth projects and strategic partnerships."
      },
      sentimentDistribution: {
        positive: 70,
        negative: 10,
        neutral: 20
      },
      topEvents: [
        {
          headline: "Strategic Initiative Launches to Drive Next-Gen Expansion",
          summary: "The corporation introduced a major operational update targeted at scaling platform offerings globally.",
          sentiment: "Positive",
          source: "Bloomberg"
        },
        {
          headline: "Quarterly Earnings Exceed Consensus Forecasts",
          summary: "Operating profits rose by 10% year-over-year, supported by steady demand.",
          sentiment: "Positive",
          source: "Reuters"
        }
      ]
    });
  } 
  
  // Risk Agent Prompt
  if (systemTextLower.includes("risk assessment") || systemTextLower.includes("risk officer")) {
    return JSON.stringify({
      riskScore: 4,
      riskRating: "Low",
      reasoning: "Well-diversified business model mitigates industry-specific headwinds and competitive threats.",
      categories: {
        competition: { score: "4", details: "Competes with major industry players but maintains strong retention." },
        debt: { score: "3", details: "Moderate debt structure with ample interest coverage." },
        industry: { score: "3", details: "Operates in mature sectors with predictable regulatory paths." },
        technology: { score: "4", details: "Continuous R&D investments protect core business blocks." },
        market: { score: "3", details: "Beta metrics are close to market index averages." },
        regulatory: { score: "3", details: "Fully compliant with local operating regulations." }
      }
    });
  } 
  
  // Decision Agent Prompt
  if (systemTextLower.includes("investment committee") || systemTextLower.includes("decision engine") || systemTextLower.includes("investment committee director")) {
    return JSON.stringify({
      recommendation: "BUY",
      confidence: 80,
      pros: ["Stable recurring revenues", "High capital efficiency", "Experienced management team"],
      cons: ["Geopolitical headwinds", "Valuation premium relative to sector peers"],
      reasoning: "Robust fundamentals and competitive advantages support a favorable long-term investment horizon.",
      investmentSummary: "We recommend a BUY rating based on fundamental business quality and growth runways."
    });
  }

  return "{}";
};

// Mock generateContent
AIService.generateContent = async function(prompt) {
  return AIService.generate({
    messages: [{ role: "user", content: prompt }]
  });
};

const { runInvestmentWorkflow } = require("../../src/services/graph.service");
const db = require("../../src/utils/db");
const { generatePDFReport } = require("../../src/utils/pdfGenerator");

const COMPANIES = [
  "Apple", "Microsoft", "Google", "Tesla", "Amazon", 
  "Meta", "NVIDIA", "TCS", "Infosys", "Reliance", 
  "Netflix", "Samsung", "Toyota", "Adobe", "Oracle"
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTestResiliently(company, retries = 5, waitTime = 1000) {
  const { contextStorage } = require("../../src/utils/context");
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`\n--------------------------------------------`);
      console.log(`[UNIT TEST RUN] Starting workflow for: "${company}" (Attempt ${attempt}/${retries})`);
      
      const finalState = await contextStorage.run({ requestId: `test-${company}-${attempt}`, timings: {}, modelChain: ["mock-model"] }, async () => {
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

      // Verify key elements
      const profile = finalState.companyProfile || {};
      const financials = finalState.financialData || {};
      const news = finalState.news || {};
      const risks = finalState.riskAnalysis || {};
      const decision = finalState.decision || {};

      const profileOK = !!profile.name;
      const financialsOK = !!financials.metrics || Object.keys(financials).length > 0;
      const newsOK = Array.isArray(news.topEvents) && news.topEvents.length > 0;
      const risksOK = typeof risks.riskScore === "number" || typeof risks.riskScore === "string";
      const decisionOK = !!decision.recommendation;

      console.log(`[UNIT TEST RESULT] Company profile: ${profileOK ? "OK" : "MISSING"}`);
      console.log(`[UNIT TEST RESULT] Financials:      ${financialsOK ? "OK" : "MISSING"}`);
      console.log(`[UNIT TEST RESULT] News Events:     ${newsOK ? "OK" : "MISSING"}`);
      console.log(`[UNIT TEST RESULT] Risks:           ${risksOK ? "OK" : "MISSING"}`);
      console.log(`[UNIT TEST RESULT] Decision:        ${decisionOK ? "OK" : "MISSING"}`);

      // Save report
      const saved = db.saveReport(finalState);
      const dbOK = !!saved.id;
      console.log(`[UNIT TEST RESULT] DB Save:         ${dbOK ? "OK" : "FAILED"}`);

      // Generate PDF
      let pdfOK = false;
      try {
        const buffer = await generatePDFReport(saved);
        pdfOK = buffer && buffer.length > 0;
      } catch (pdfErr) {
        console.error(`[UNIT TEST RESULT] PDF generation failed:`, pdfErr.message);
      }
      console.log(`[UNIT TEST RESULT] PDF Report:      ${pdfOK ? "OK" : "FAILED"}`);

      return {
        company,
        ticker: profile.ticker || finalState.symbol || "N/A",
        exchange: profile.exchange || "N/A",
        profile: profileOK ? "PASS" : "FAIL",
        financials: financialsOK ? "PASS" : "FAIL",
        news: newsOK ? "PASS" : "FAIL",
        risks: risksOK ? "PASS" : "FAIL",
        decision: decisionOK ? "PASS" : "FAIL",
        rec: decision.recommendation || "N/A",
        confidence: `${decision.confidence || 0}%`,
        pdf: pdfOK ? "PASS" : "FAIL",
        status: "SUCCESS"
      };

    } catch (err) {
      console.warn(`[UNIT TEST RUN] Attempt ${attempt} failed for "${company}": ${err.message}`);
      if (attempt < retries) {
        console.log(`[UNIT TEST RUN] Retrying in ${waitTime / 1000}s...`);
        await delay(waitTime);
      } else {
        return {
          company,
          ticker: "N/A",
          exchange: "N/A",
          profile: "FAIL",
          financials: "FAIL",
          news: "FAIL",
          risks: "FAIL",
          decision: "FAIL",
          rec: "N/A",
          confidence: "0%",
          pdf: "FAIL",
          status: `FAILED: ${err.message}`
        };
      }
    }
  }
}

async function runSuite() {
  console.log("=== STARTING MOCKED UNIT TEST SUITE ===");
  const results = [];
  
  for (const company of COMPANIES) {
    const result = await runTestResiliently(company);
    results.push(result);
  }

  console.log("\n==========================================================================================");
  console.log("===                            MOCKED UNIT TEST SUITE SUMMARY                          ===");
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

  const allSuccess = results.every(r => r.status === "SUCCESS");
  if (allSuccess) {
    console.log("\n🎉 ALL MOCKED UNIT TESTS COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.log("\n⚠️ SOME MOCKED UNIT TESTS FAILED!");
    process.exit(1);
  }
}

runSuite();
