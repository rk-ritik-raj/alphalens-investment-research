/**
 * Utility to parse JSON safely from LLM text responses,
 * especially handling Markdown code fences (e.g. ```json ... ```).
 */
function parseJSON(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Invalid input: text is empty or not a string.");
  }

  let cleaned = rawText.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "").trim();
  }

  // Fallback: search for first '{' or '[' and last '}' or ']'
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");

  let startIndex = -1;
  let endIndex = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endIndex = lastBrace;
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endIndex = lastBracket;
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse JSON. Raw content was:\n", rawText);
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
}

module.exports = {
  parseJSON,
};
