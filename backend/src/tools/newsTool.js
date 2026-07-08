const { requestWithRetry } = require("../utils/apiClient");
const { parseJSON } = require("../utils/jsonParser");

const BASE_URL = "https://finnhub.io/api/v1";
const token = process.env.FINNHUB_API_KEY;

async function newsTool(symbol) {
  try {
    if (!symbol) {
      return { success: false, message: "Symbol is required." };
    }

    const today = new Date().toISOString().split("T")[0];
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const fromDate = oneMonthAgo.toISOString().split("T")[0];

    let news = null;
    try {
      news = await requestWithRetry({
        url: `${BASE_URL}/company-news`,
        method: "GET",
        params: { symbol, from: fromDate, to: today, token },
      });
    } catch (err) {
      console.warn(`[newsTool] Finnhub news fetch failed for symbol "${symbol}": ${err.message}`);
    }

    if (!news || !Array.isArray(news) || news.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Sort by datetime descending and limit to top 8 news items
    const sortedNews = news
      .sort((a, b) => b.datetime - a.datetime)
      .slice(0, 8)
      .map(item => ({
        headline: item.headline || "N/A",
        summary: item.summary ? (item.summary.length > 250 ? item.summary.substring(0, 250) + "..." : item.summary) : "N/A",
        source: item.source || "N/A",
        datetime: item.datetime || Math.floor(Date.now() / 1000),
        url: item.url || "",
      }));

    return {
      success: true,
      data: sortedNews,
    };
  } catch (error) {
    console.error("newsTool error:", error.message);
    return {
      success: false,
      message: `Failed to fetch company news: ${error.message}`,
    };
  }
}

module.exports = {
  newsTool,
};

