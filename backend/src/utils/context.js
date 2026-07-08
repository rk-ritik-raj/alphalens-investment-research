const { AsyncLocalStorage } = require("async_hooks");

/**
 * AsyncLocalStorage context hook for structured logging and request observability.
 * Stores request-scoped properties (requestId, startTime, currentModel, retryCount)
 * across asynchronous execution paths without parameter passing.
 */
const contextStorage = new AsyncLocalStorage();

module.exports = {
  contextStorage,
};
