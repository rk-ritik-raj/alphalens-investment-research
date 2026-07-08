const express = require("express");
const cors = require("cors");
const researchRoutes = require("./routes/research.routes");
const healthRoutes = require("./routes/health.routes");
const historyRoutes = require("./routes/history.routes");
const testAIRoutes = require("./routes/test-ai.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/test-ai", testAIRoutes);
app.use("/api", historyRoutes);
module.exports = app;
