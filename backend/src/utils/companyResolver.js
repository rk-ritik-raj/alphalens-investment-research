const { requestWithRetry } = require("./apiClient");
const AIService = require("../services/ai.service");
const { parseJSON } = require("./jsonParser");
const cache = require("./cache");

const BASE_URL = "https://finnhub.io/api/v1";
const token = process.env.FINNHUB_API_KEY;

// Strict mapping of exact/popular company names to tickers for instant matching
const POPULAR_COMPANIES = {
  "google": "GOOGL",
  "alphabet": "GOOGL",
  "facebook": "META",
  "meta": "META",
  "nvidia": "NVDA",
  "microsoft": "MSFT",
  "apple": "AAPL",
  "tesla": "TSLA",
  "tcs": "TCS",
  "reliance": "RELIANCE",
  "netflix": "NFLX",
  "amazon": "AMZN",
  "infosys": "INFY",
  "samsung": "SMSN.L",
  "sony": "SONY",
  "toyota": "TM",
  "intel": "INTC",
  "amd": "AMD",
  "uber": "UBER",
  "airbnb": "ABNB",
  "adobe": "ADBE",
  "oracle": "ORCL",
  "salesforce": "CRM"
};

async function resolveCompany(companyInput) {
  if (!companyInput || typeof companyInput !== "string") {
    return { exists: false };
  }

  const query = companyInput.trim();
  const lowerQuery = query.toLowerCase();
  const cacheKey = `resolve:${lowerQuery}`;

  const cachedResolution = cache.get(cacheKey);
  if (cachedResolution) {
    console.log(`[Resolver] Cache hit for query: "${query}"`);
    return cachedResolution;
  }

  // 1. Check popular mapping dictionary
  if (POPULAR_COMPANIES[lowerQuery]) {
    const symbol = POPULAR_COMPANIES[lowerQuery];
    console.log(`[Resolver] Popular mapping hit: "${query}" -> "${symbol}"`);
    const resolution = {
      exists: true,
      symbol,
      name: query.charAt(0).toUpperCase() + query.slice(1),
    };
    cache.set(cacheKey, resolution);
    return resolution;
  }

  // 2. Perform Finnhub search to find potential matches
  let searchResults = [];
  try {
    const searchData = await requestWithRetry({
      url: `${BASE_URL}/search`,
      method: "GET",
      params: { q: query, token },
    });
    searchResults = (searchData && searchData.result) || [];
  } catch (error) {
    console.warn(`[Resolver] Finnhub search failed for "${query}":`, error.message);
  }

  // If input matches ticker pattern, check for direct ticker match in search results
  const isTickerPattern = /^[A-Z]{1,5}$/i.test(query);
  if (isTickerPattern) {
    const upperQuery = query.toUpperCase();
    const directMatch = searchResults.find(item => item.symbol.toUpperCase() === upperQuery);
    if (directMatch) {
      console.log(`[Resolver] Direct ticker search match: "${query}" -> "${directMatch.symbol}"`);
      const resolution = {
        exists: true,
        symbol: directMatch.symbol,
        name: directMatch.description || query,
      };
      cache.set(cacheKey, resolution);
      return resolution;
    }
  }

  // 3. Fall back to Gemini reasoning to resolve aliases, spelling mistakes, or detect fictional entities
  console.log(`[Resolver] Querying Gemini resolver for "${query}"...`);
  try {
    const prompt = `You are a financial systems resolver.
Your task is to resolve the user's company search query: "${query}".
We also found the following potential matches from our stock search API:
${JSON.stringify(searchResults.slice(0, 10))}

Determine:
1. Is this query referring to a real, valid publicly traded company or stock ticker in the world (or a very common alias)?
2. If yes, what is its primary stock ticker symbol? (Prefer US exchanges if listed, e.g., AAPL for Apple, GOOGL for Google/Alphabet, or local exchanges for international companies like RELIANCE for Reliance Industries, TCS for Tata Consultancy Services, or 7203 for Toyota).
3. If it is a spelling mistake, resolve it to the correct company's ticker (e.g., "nvidya" -> "NVDA").
4. If this is a completely fictitious, random, or non-existent company name that cannot be mapped to any real public company, return exists: false.

Return a JSON object in this exact format:
{
  "exists": true or false,
  "ticker": "RESOLVED_TICKER" (or null if exists is false),
  "name": "Official Company Name" (or null if exists is false)
}
Return ONLY valid JSON. Do not include markdown code block formatting (like \`\`\`json) or any conversational text.`;

    const text = await AIService.generate({
      messages: [{ role: "user", content: prompt }]
    });

    const parsed = parseJSON(text);
    if (parsed && parsed.exists && parsed.ticker) {
      console.log(`[Resolver] Resolved: "${query}" -> "${parsed.ticker}" (${parsed.name})`);
      const resolution = {
        exists: true,
        symbol: parsed.ticker.toUpperCase(),
        name: parsed.name,
      };
      cache.set(cacheKey, resolution);
      return resolution;
    } else {
      console.log(`[Resolver] Marked company as NOT_FOUND for query "${query}"`);
      const resolution = { exists: false };
      cache.set(cacheKey, resolution);
      return resolution;
    }
  } catch (error) {
    console.error(`[Resolver] Gemini resolution failed:`, error.message);
    if (searchResults.length > 0) {
      const bestMatch = searchResults.find(item => !item.symbol.includes(".") && item.type === "Common Stock") || searchResults[0];
      console.log(`[Resolver] Gemini failed. Falling back to search match: "${query}" -> "${bestMatch.symbol}"`);
      const resolution = {
        exists: true,
        symbol: bestMatch.symbol,
        name: bestMatch.description || query,
      };
      cache.set(cacheKey, resolution);
      return resolution;
    }
    const resolution = { exists: false };
    cache.set(cacheKey, resolution);
    return resolution;
  }
}

module.exports = {
  resolveCompany,
};
