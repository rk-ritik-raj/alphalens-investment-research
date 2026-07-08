const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const FILE_PATH = path.join(DATA_DIR, "reports.json");

// Ensure data directory and file exist
function initializeDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), "utf-8");
  }
}

function readData() {
  initializeDb();
  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file, returning empty array:", error.message);
    return [];
  }
}

function writeData(data) {
  initializeDb();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error.message);
    throw new Error("Database write error");
  }
}

function getReports() {
  const reports = readData();
  // Sort by createdAt descending
  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getReportById(id) {
  const reports = readData();
  return reports.find((r) => r.id === id) || null;
}

function saveReport(reportData) {
  const reports = readData();
  
  const newReport = {
    id: reportData.id || `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    company: reportData.company || "",
    symbol: reportData.symbol || "",
    companyProfile: reportData.companyProfile || {},
    financialData: reportData.financialData || {},
    news: reportData.news || [],
    research: reportData.research || {},
    riskAnalysis: reportData.riskAnalysis || {},
    decision: reportData.decision || {},
    errors: reportData.errors || [],
    meta: reportData.meta || {},
    createdAt: reportData.createdAt || new Date().toISOString(),
  };

  const existingIndex = reports.findIndex((r) => r.id === newReport.id);
  if (existingIndex !== -1) {
    reports[existingIndex] = newReport;
  } else {
    reports.push(newReport);
  }

  writeData(reports);
  return newReport;
}

module.exports = {
  getReports,
  getReportById,
  saveReport,
};
