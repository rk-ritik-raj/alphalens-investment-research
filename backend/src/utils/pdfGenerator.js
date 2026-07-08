const PDFDocument = require("pdfkit");

/**
 * Generates a professional PDF document for the investment report.
 * @param {Object} report The investment report object from database.
 * @returns {Promise<Buffer>} The PDF file buffer.
 */
function generatePDFReport(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const profile = report.companyProfile || {};
      const research = report.research || {};
      const financials = report.financialData || {};
      const news = report.news || {};
      const risks = report.riskAnalysis || {};
      const decision = report.decision || {};

      // --- Colors ---
      const primaryColor = "#0f172a";   // Dark slate
      const accentColor = decision.recommendation === "BUY" ? "#10b981" : "#ef4444"; // Green for BUY, Red for PASS
      const textColor = "#334155";      // Slate grey
      const headerColor = "#1e293b";    // Dark slate grey
      const lightBg = "#f8fafc";        // Slate light highlight

      // --- Header Page / Logo / Title ---
      doc.fillColor(primaryColor)
         .fontSize(24)
         .font("Helvetica-Bold")
         .text("ALPHALENS AI", 50, 50);

      doc.fontSize(10)
         .font("Helvetica")
         .fillColor(textColor)
         .text("AI-POWERED MULTI-AGENT INVESTMENT RESEARCH PLATFORM", 50, 75);

      // Horizontal line
      doc.strokeColor("#e2e8f0")
         .lineWidth(1)
         .moveTo(50, 90)
         .lineTo(545, 90)
         .stroke();

      // --- Company Block ---
      doc.y = 110;
      doc.fontSize(20)
         .font("Helvetica-Bold")
         .fillColor(headerColor)
         .text(`${profile.name || report.company} (${profile.ticker || report.symbol})`);

      doc.fontSize(10)
         .font("Helvetica")
         .fillColor(textColor)
         .text(`Industry: ${profile.finnhubIndustry || research.industry || "N/A"}`)
         .text(`Exchange: ${profile.exchange || "N/A"}`)
         .text(`Website: ${profile.weburl || "N/A"}`);

      // --- Recommendation Card ---
      const cardY = 180;
      doc.rect(50, cardY, 495, 75)
         .fill(lightBg);

      doc.fillColor(headerColor)
         .fontSize(12)
         .font("Helvetica-Bold")
         .text("INVESTMENT RECOMMENDATION", 70, cardY + 15);

      // Recommendation text with accent color
      doc.fillColor(accentColor)
         .fontSize(28)
         .font("Helvetica-Bold")
         .text(decision.recommendation || "PASS", 70, cardY + 30);

      // Confidence Score
      doc.fillColor(textColor)
         .fontSize(12)
         .font("Helvetica-Bold")
         .text(`CONFIDENCE SCORE: ${decision.confidence || 0}%`, 350, cardY + 32);

      // --- Investment Summary ---
      doc.y = cardY + 100;
      doc.fontSize(14)
         .font("Helvetica-Bold")
         .fillColor(headerColor)
         .text("EXECUTIVE INVESTMENT THESIS");

      doc.fontSize(10)
         .font("Helvetica")
         .fillColor(textColor)
         .text(decision.investmentSummary || decision.reasoning || "No summary available.", {
           width: 495,
           align: "justify",
           lineGap: 4
         });

      // --- Pros and Cons ---
      doc.moveDown(1.5);
      const prosConsY = doc.y;
      
      // Pros column (left)
      doc.fontSize(12)
         .font("Helvetica-Bold")
         .fillColor("#10b981")
         .text("PROS / CATALYSTS", 50, prosConsY);
         
      let currentProsY = prosConsY + 20;
      const prosList = decision.pros || [];
      if (prosList.length === 0) {
        doc.fontSize(10).font("Helvetica").fillColor(textColor).text("- N/A", 50, currentProsY);
        currentProsY += 15;
      } else {
        prosList.forEach(pro => {
          doc.fontSize(10)
             .font("Helvetica")
             .fillColor(textColor)
             .text(`• ${pro}`, 50, currentProsY, { width: 230 });
          currentProsY += doc.heightOfString(`• ${pro}`, { width: 230 }) + 5;
        });
      }

      // Cons column (right)
      doc.fontSize(12)
         .font("Helvetica-Bold")
         .fillColor("#ef4444")
         .text("CONS / RISKS", 300, prosConsY);

      let currentConsY = prosConsY + 20;
      const consList = decision.cons || [];
      if (consList.length === 0) {
        doc.fontSize(10).font("Helvetica").fillColor(textColor).text("- N/A", 300, currentConsY);
        currentConsY += 15;
      } else {
        consList.forEach(con => {
          doc.fontSize(10)
             .font("Helvetica")
             .fillColor(textColor)
             .text(`• ${con}`, 300, currentConsY, { width: 230 });
          currentConsY += doc.heightOfString(`• ${con}`, { width: 230 }) + 5;
        });
      }

      // Start new page for Financials and News
      doc.addPage();

      // --- Company Profile & Business Model ---
      doc.fillColor(headerColor)
         .fontSize(14)
         .font("Helvetica-Bold")
         .text("BUSINESS OVERVIEW");

      doc.fontSize(10)
         .font("Helvetica")
         .fillColor(textColor)
         .text(research.summary || "No overview available.", { width: 495, lineGap: 3 })
         .moveDown(0.5)
         .font("Helvetica-Bold")
         .text("Core Business Model: ")
         .font("Helvetica")
         .text(research.businessModel || "N/A", { width: 495, lineGap: 3 });

      // --- Financial Profile ---
      doc.moveDown(1.5);
      doc.fillColor(headerColor)
         .fontSize(14)
         .font("Helvetica-Bold")
         .text("FINANCIAL METRICS & VALUATION");

      // Draw financials table
      let finY = doc.y + 10;
      doc.rect(50, finY, 495, 20).fill(lightBg);
      doc.fillColor(headerColor)
         .font("Helvetica-Bold")
         .fontSize(9)
         .text("Metric", 60, finY + 6)
         .text("Value / Analysis", 250, finY + 6);

      const fMetrics = financials.metrics || {};
      const fRatios = financials.valuationRatios || {};
      
      const rows = [
        ["Market Capitalization", fMetrics.marketCap || "N/A"],
        ["Revenue & Growth", fMetrics.revenue || "N/A"],
        ["Profit & Margin", fMetrics.profit || "N/A"],
        ["Cash Flow", fMetrics.cashFlow || "N/A"],
        ["Debt & Leverage", fMetrics.debt || "N/A"],
        ["P/E Ratio", fRatios.peRatio || "N/A"],
        ["Earnings Per Share (EPS)", fRatios.eps || "N/A"],
        ["Debt-to-Equity Ratio", fRatios.debtEquityRatio || "N/A"]
      ];

      let currentRowY = finY + 20;
      rows.forEach(([label, value]) => {
        doc.fillColor(textColor)
           .font("Helvetica")
           .text(label, 60, currentRowY + 6)
           .font("Helvetica-Bold")
           .text(String(value), 250, currentRowY + 6, { width: 280 });
        
        doc.strokeColor("#f1f5f9")
           .moveTo(50, currentRowY + 20)
           .lineTo(545, currentRowY + 20)
           .stroke();

        currentRowY += 20;
      });

      doc.y = currentRowY + 10;
      const fHealth = financials.financialHealth || {};
      doc.fontSize(10)
         .font("Helvetica-Bold")
         .fillColor(headerColor)
         .text(`Financial Health Rating: ${fHealth.rating || "N/A"}`)
         .font("Helvetica")
         .fillColor(textColor)
         .text(fHealth.reasoning || "", { width: 495, lineGap: 3 });

      // Start new page for Risk and News
      doc.addPage();

      // --- Risk Assessment ---
      doc.fillColor(headerColor)
         .fontSize(14)
         .font("Helvetica-Bold")
         .text(`RISK ASSESSMENT (OVERALL SCORE: ${risks.riskScore || 0}/10 - ${risks.riskRating || "Unknown"})`);

      doc.fontSize(10)
         .font("Helvetica")
         .fillColor(textColor)
         .text(risks.reasoning || "No risk analysis reasoning provided.", { width: 495, lineGap: 3 })
         .moveDown(1);

      // Risk breakdown grid
      let riskY = doc.y;
      doc.rect(50, riskY, 495, 20).fill(lightBg);
      doc.fillColor(headerColor)
         .font("Helvetica-Bold")
         .fontSize(9)
         .text("Risk Factor", 60, riskY + 6)
         .text("Score", 200, riskY + 6)
         .text("Analysis", 250, riskY + 6);

      const rCats = risks.categories || {};
      const riskRows = [
        ["Competition", rCats.competition?.score || "5", rCats.competition?.details || "N/A"],
        ["Debt/Leverage", rCats.debt?.score || "5", rCats.debt?.details || "N/A"],
        ["Industry Sector", rCats.industry?.score || "5", rCats.industry?.details || "N/A"],
        ["Technology", rCats.technology?.score || "5", rCats.technology?.details || "N/A"],
        ["Market Price Volatility", rCats.market?.score || "5", rCats.market?.details || "N/A"],
        ["Regulatory/Compliance", rCats.regulatory?.score || "5", rCats.regulatory?.details || "N/A"]
      ];

      let currentRiskRowY = riskY + 20;
      riskRows.forEach(([label, score, desc]) => {
        doc.fillColor(textColor)
           .font("Helvetica")
           .text(label, 60, currentRiskRowY + 6)
           .font("Helvetica-Bold")
           .text(`${score}/10`, 200, currentRiskRowY + 6)
           .font("Helvetica")
           .text(desc, 250, currentRiskRowY + 6, { width: 285 });

        const rowHeight = Math.max(20, doc.heightOfString(desc, { width: 285 }) + 10);
        
        doc.strokeColor("#f1f5f9")
           .moveTo(50, currentRiskRowY + rowHeight)
           .lineTo(545, currentRiskRowY + rowHeight)
           .stroke();

        currentRiskRowY += rowHeight;
      });

      // --- Recent News & Sentiment ---
      doc.y = currentRiskRowY + 15;
      const nSentiment = news.newsSentiment || {};
      doc.fillColor(headerColor)
         .fontSize(14)
         .font("Helvetica-Bold")
         .text(`RECENT NEWS & MARKET SENTIMENT (${nSentiment.rating || "Neutral"} - Score: ${nSentiment.score || 50}/100)`);

      const topNews = news.topEvents || [];
      if (topNews.length === 0) {
        doc.fontSize(10)
           .font("Helvetica")
           .fillColor(textColor)
           .text("No recent news events summarized.", { width: 495 });
      } else {
        topNews.forEach(item => {
          doc.moveDown(0.8);
          doc.fontSize(10)
             .font("Helvetica-Bold")
             .fillColor(headerColor)
             .text(`• ${item.headline} (${item.source || "Unknown"}) - Sentiment: ${item.sentiment}`);
          doc.fontSize(9)
             .font("Helvetica")
             .fillColor(textColor)
             .text(item.summary || "", { width: 480, lineGap: 2 });
        });
      }

      // --- Footer for all pages ---
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .fillColor("#94a3b8")
           .text(`AlphaLens AI Investment Report • Page ${i + 1} of ${pageCount} • Generated on ${new Date(report.createdAt).toLocaleDateString()}`, 50, 785, {
             align: "center",
             width: 495
           });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generatePDFReport,
};
