const { requestWithRetry } = require("../utils/apiClient");

const BASE_URL = "https://finnhub.io/api/v1";
const token = process.env.FINNHUB_API_KEY;

async function financialTool(symbol) {
  try {
    if (!symbol) {
      return { success: false, message: "Symbol is required." };
    }

    let data = null;
    try {
      data = await requestWithRetry({
        url: `${BASE_URL}/stock/metric`,
        method: "GET",
        params: { symbol, metric: "all", token },
      });
    } catch (err) {
      console.warn(`[financialTool] Finnhub metrics fetch failed for symbol "${symbol}": ${err.message}`);
    }

    if (!data || !data.metric || Object.keys(data.metric).length === 0) {
      return {
        success: true,
        data: {
          symbol,
          metric: {}
        }
      };
    }

    return {
      success: true,
      data: {
        symbol: data.symbol || symbol,
        metric: data.metric || {},
      },
    };
  } catch (error) {
    console.error("financialTool error:", error.message);
    return {
      success: false,
      message: `Failed to fetch financial metrics: ${error.message}`,
    };
  }
}

module.exports = {
  financialTool,
};

