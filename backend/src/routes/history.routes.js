const express = require("express");
const router = express.Router();

const {
  getHistory,
  getReport,
  getReportPDF,
} = require("../controllers/history.controller");

// History list
router.get("/history", getHistory);

// Specific report content
router.get("/report/:id", getReport);

// Specific report PDF download
router.get("/report/:id/pdf", getReportPDF);

module.exports = router;
