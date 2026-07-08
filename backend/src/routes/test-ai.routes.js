const express = require("express");
const router = express.Router();

const { generateContent } = require("../services/ai.service");

router.get("/", async (req, res) => {
  try {
    const result = await generateContent(
      "Explain what NVIDIA does in 50 words."
    );

    res.json({
      success: true,
      response: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
