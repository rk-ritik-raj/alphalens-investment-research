const axios = require("axios");
const cache = require("./cache");

/**
 * Resilient HTTP client wrapper with native timeouts, exponential backoff retries,
 * and built-in GET request caching.
 * 
 * @param {Object} config Axios request configuration.
 * @param {number} retries Number of retries on failure (default: 3).
 * @param {number} backoff Initial retry delay in milliseconds (default: 1000).
 * @returns {Promise<any>} Response body data.
 */
async function requestWithRetry(config, retries = 3, backoff = 1000) {
  const method = (config.method || "GET").toUpperCase();
  const isCacheable = method === "GET";
  
  // Create unique cache key for GET requests based on URL and params
  const cacheKey = `${method}:${config.url}:${JSON.stringify(config.params || {})}`;
  
  if (isCacheable) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[API Client] Cache hit for: ${config.url}`);
      return cachedData;
    }
  }

  // Ensure default timeout of 10s is passed to Axios config
  const requestConfig = {
    timeout: 10000,
    ...config,
  };

  try {
    const response = await axios(requestConfig);
    
    // Validate that the response is not an HTML block page
    if (response.data && typeof response.data === "string" && (
      response.data.trim().toUpperCase().startsWith("<!DOCTYPE") ||
      response.data.trim().toLowerCase().startsWith("<html") ||
      response.data.toLowerCase().includes("protected by sophos")
    )) {
      throw new Error("HTML response received instead of JSON (possibly blocked by proxy/firewall).");
    }
    
    // Cache the response data (default 5 min TTL)
    if (isCacheable && response.data) {
      cache.set(cacheKey, response.data);
    }
    
    return response.data;
  } catch (error) {
    const isNetworkError = !error.response;
    const isRateLimit = error.response && error.response.status === 429;
    const isServer5xx = error.response && error.response.status >= 500;

    // Retry only on network issues, rate limits, or server errors
    if ((isNetworkError || isRateLimit || isServer5xx) && retries > 0) {
      console.warn(
        `[API Client] Request failed to ${config.url} (${error.message}). Retrying in ${backoff}ms... (${retries} left)`
      );
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return requestWithRetry(config, retries - 1, backoff * 2);
    }

    throw error;
  }
}

module.exports = {
  requestWithRetry,
};
