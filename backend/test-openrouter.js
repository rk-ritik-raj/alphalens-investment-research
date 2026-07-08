const path = require("path");
const fs = require("fs");
const axios = require("axios");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load dotenv
const dotenvResult = require("dotenv").config({ path: path.join(__dirname, ".env") });
if (dotenvResult.error) {
  console.error("❌ Dotenv load error:", dotenvResult.error);
} else {
  console.log("✅ Dotenv loaded successfully.");
}

console.log("Working directory:", process.cwd());

const requiredVars = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_MODEL",
  "PORT",
  "FINNHUB_API_KEY"
];

console.log("\n=== Environment Variable Verification ===");
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value === undefined) {
    console.log(`❌ ${varName}: NOT DEFINED`);
  } else {
    const hasLeadingQuote = value.startsWith('"') || value.startsWith("'");
    const hasTrailingQuote = value.endsWith('"') || value.endsWith("'");
    const hasHiddenSpaces = value.trim() !== value;
    const hasNewlines = value.includes("\n") || value.includes("\r");
    
    let loggedValue = value;
    if (varName === "OPENROUTER_API_KEY" || varName === "FINNHUB_API_KEY") {
      loggedValue = value.substring(0, 10) + "... (length: " + value.length + ")";
    }

    console.log(`- ${varName}: ${JSON.stringify(loggedValue)}`);
    if (hasLeadingQuote || hasTrailingQuote) {
      console.warn(`  ⚠️ Warning: Contains quotes at start/end!`);
    }
    if (hasHiddenSpaces) {
      console.warn(`  ⚠️ Warning: Contains leading or trailing spaces!`);
    }
    if (hasNewlines) {
      console.warn(`  ⚠️ Warning: Contains newline characters!`);
    }
  }
});

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free";

if (!apiKey) {
  console.error("❌ Cannot run OpenRouter test because OPENROUTER_API_KEY is not defined");
  process.exit(1);
}

console.log("\n=== Testing OpenRouter Direct Call ===");
const requestBody = {
  model: model,
  messages: [
    { role: "user", content: "Hello! Respond with exactly the word 'SUCCESS' if you receive this." }
  ],
  temperature: 0.2,
  max_tokens: 50
};

console.log("Request endpoint: POST https://openrouter.ai/api/v1/chat/completions");
console.log("Request Body:", JSON.stringify(requestBody, null, 2));

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${apiKey}`,
  "HTTP-Referer": "https://github.com/AlphaLens-AI",
  "X-Title": "AlphaLens AI"
};

console.log("Request Headers (Authorization masked):", {
  ...headers,
  "Authorization": `Bearer ${apiKey.substring(0, 10)}...`
});

axios.post("https://openrouter.ai/api/v1/chat/completions", requestBody, { headers })
  .then(response => {
    console.log("\n✅ Response Status:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Body:", JSON.stringify(response.data, null, 2));
  })
  .catch(err => {
    console.error("\n❌ Request failed!");
    if (err.response) {
      console.error("Response Status:", err.response.status);
      console.error("Response Headers:", err.response.headers);
      console.error("Response Body:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error Message:", err.message);
    }
  });
