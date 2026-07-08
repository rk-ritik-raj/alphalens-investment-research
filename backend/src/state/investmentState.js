const { Annotation } = require("@langchain/langgraph");

/**
 * Shared Investment State definition using LangGraph's Annotation API.
 * Defines the state schema, initial values, and state update reducers.
 */
const InvestmentStateAnnotation = Annotation.Root({
  // The raw company search input entered by the user
  company: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => "",
  }),

  // Resolved stock symbol (e.g., "NVDA")
  symbol: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => "",
  }),

  // Normalized company profile data resolved by the Company Tool
  companyProfile: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => ({}),
  }),

  // Detailed financial metrics and ratios resolved by the Financial Agent
  financialData: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => ({}),
  }),

  // Sentiment-categorized news articles resolved by the News Agent
  news: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => ({}),
  }),

  // Qualitative company profile analysis resolved by the Research Agent
  research: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => ({}),
  }),

  // Composite risk matrix analysis completed by the Risk Agent
  riskAnalysis: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => ({}),
  }),

  // Final BUY or PASS recommendation issued by the Decision Agent
  decision: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => ({}),
  }),

  // Cumulative array of warning or error messages generated during execution
  errors: Annotation({
    reducer: (current, next) => {
      if (!next) return current;
      const nextArray = Array.isArray(next) ? next : [next];
      return [...current, ...nextArray];
    },
    default: () => [],
  }),

  // Metadata about model, provider, execution times
  meta: Annotation({
    reducer: (current, next) => next !== undefined ? next : current,
    default: () => ({}),
  }),
});

module.exports = {
  InvestmentStateAnnotation,
};
