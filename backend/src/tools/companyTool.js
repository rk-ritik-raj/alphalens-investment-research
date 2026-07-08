const { requestWithRetry } = require("../utils/apiClient");
const { parseJSON } = require("../utils/jsonParser");
const { resolveCompany } = require("../utils/companyResolver");

const BASE_URL = "https://finnhub.io/api/v1";
const token = process.env.FINNHUB_API_KEY;

async function companyTool(companyInput) {
  try {
    if (!companyInput) {
      return { success: false, message: "Company input is empty." };
    }

    // 1. Resolve company name using the Company Resolution Layer
    const resolution = await resolveCompany(companyInput);
    if (!resolution.exists || !resolution.symbol) {
      return {
        success: false,
        isNotFound: true,
        message: `Company "${companyInput}" could not be found or is not a publicly traded entity. Please check the name.`,
      };
    }

    const symbol = resolution.symbol;
    let profile = null;

    // 2. Try fetching from Finnhub if symbol looks valid
    if (symbol && symbol.length <= 10) {
      try {
        profile = await requestWithRetry({
          url: `${BASE_URL}/stock/profile2`,
          method: "GET",
          params: { symbol, token },
        });
      } catch (err) {
        console.warn(`[companyTool] Finnhub profile fetch failed for symbol "${symbol}": ${err.message}`);
      }
    }

    // 3. Use basic resolved info if profile is missing, has no name, or Finnhub returned an empty object
    if (!profile || !profile.name) {
      return {
        success: true,
        symbol,
        data: {
          name: resolution.name || companyInput,
          ticker: symbol,
          finnhubIndustry: "N/A",
          logo: "",
          weburl: "",
          marketCapitalization: 0,
          shareOutstanding: 0,
          exchange: "N/A",
          currency: "N/A",
          country: "N/A"
        },
      };
    }

    return {
      success: true,
      symbol,
      data: profile,
    };
  } catch (error) {
    console.error("companyTool error:", error.message);
    return {
      success: false,
      message: `Failed to fetch company profile: ${error.message}`,
    };
  }
}

module.exports = {
  companyTool,
};


