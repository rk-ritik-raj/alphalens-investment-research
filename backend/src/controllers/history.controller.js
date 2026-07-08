const db = require("../utils/db");
const { generatePDFReport } = require("../utils/pdfGenerator");

const getHistory = async (req, res) => {
  try {
    const reports = db.getReports();
    // Return key summary details instead of the full giant payloads to keep payload light
    const summaries = reports.map(r => ({
      id: r.id,
      company: r.company,
      symbol: r.symbol,
      recommendation: r.decision?.recommendation || "PASS",
      confidence: r.decision?.confidence || 0,
      riskRating: r.riskAnalysis?.riskRating || "Medium",
      newsSentiment: r.news?.newsSentiment?.rating || "Neutral",
      createdAt: r.createdAt
    }));

    return res.json({
      success: true,
      data: summaries,
    });
  } catch (error) {
    console.error("Error in getHistory controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = db.getReportById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Investment report not found.",
      });
    }

    return res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error in getReport controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReportPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const report = db.getReportById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Investment report not found.",
      });
    }

    const pdfBuffer = await generatePDFReport(report);
    const filename = `AlphaLens_Report_${report.symbol || "unknown"}_${report.id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in getReportPDF controller:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to generate PDF: ${error.message}`,
    });
  }
};

module.exports = {
  getHistory,
  getReport,
  getReportPDF,
};
