import React from "react";
import { 
  FileText, Globe, DollarSign, BarChart2, ShieldAlert, 
  TrendingUp, ThumbsUp, ThumbsDown, AlertCircle, ArrowUpRight, HelpCircle,
  BrainCircuit
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { getPDFUrl } from "../../services/api";

function DashboardView({ report }) {
  if (!report) return null;

  const profile = report.companyProfile || {};
  const research = report.research || {};
  const financials = report.financialData || {};
  const news = report.news || {};
  const risks = report.riskAnalysis || {};
  const decision = report.decision || {};

  const isBuy = decision.recommendation === "BUY";

  // Prepare data for the Risk Radar Chart
  const riskCategories = risks.categories || {};
  const riskChartData = Object.keys(riskCategories).map(key => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: parseFloat(riskCategories[key]?.score || 5),
    fullMark: 10
  }));

  // Prepare data for Sentiment distribution
  const sentimentDistribution = news.sentimentDistribution || { positive: 0, negative: 0, neutral: 0 };
  const sentimentData = [
    { name: "Positive", value: parseInt(sentimentDistribution.positive || 0), fill: "#10b981" },
    { name: "Neutral", value: parseInt(sentimentDistribution.neutral || 0), fill: "#94a3b8" },
    { name: "Negative", value: parseInt(sentimentDistribution.negative || 0), fill: "#ef4444" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Header Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">{profile.name || report.company}</h1>
            <span className="bg-slate-800 text-slate-300 font-mono text-sm px-2.5 py-1 rounded-lg border border-slate-700">
              {profile.ticker || report.symbol}
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold uppercase">
              {profile.finnhubIndustry || research.industry || "Equity"}
            </span>
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span>Exchange: {profile.exchange || "N/A"}</span>
            <span className="text-slate-600">•</span>
            <span>Currency: {profile.currency || "USD"}</span>
          </p>
          {profile.weburl && (
            <a 
              href={profile.weburl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 hover:underline transition-all mt-1"
            >
              <Globe className="h-4 w-4" />
              <span>{profile.weburl.replace("https://", "").replace("www.", "")}</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}

          {/* Audit & Observability Metadata Ribbon */}
          {report.meta && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80 text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">AI Provider</span>
                <span className="text-xs font-semibold text-white">{report.meta.provider || "OpenRouter"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">LLM Model</span>
                <span className="text-xs font-semibold text-emerald-400 font-mono truncate block max-w-[200px]" title={report.meta.model}>
                  {(report.meta.model || "").split("/").pop()}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Workflow Time</span>
                <span className="text-xs font-semibold text-white">
                  {report.meta.workflowDuration ? `${(report.meta.workflowDuration / 1000).toFixed(2)}s` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Execution Timestamp</span>
                <span className="text-xs font-semibold text-slate-300 font-mono">
                  {report.meta.timestamp ? new Date(report.meta.timestamp).toLocaleString() : new Date(report.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Download PDF Trigger */}
        <a 
          href={getPDFUrl(report.id)} 
          download
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 rounded-2xl font-bold shadow-md hover:shadow-emerald-500/10 transition-all cursor-pointer self-start md:self-auto"
        >
          <FileText className="h-5 w-5" />
          <span>Download PDF Report</span>
        </a>
      </div>

      {/* Primary Recommendation and Thesis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommendation Panel */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between items-center text-center shadow-xl backdrop-blur-sm relative overflow-hidden">
          {/* Subtle Glow */}
          <div className={`absolute top-0 inset-x-0 h-1.5 ${isBuy ? "bg-emerald-500" : "bg-red-500"}`}></div>

          <div className="w-full space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recommendation</h3>
            
            <div className={`inline-flex items-center justify-center p-6 rounded-full ${isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {isBuy ? <ThumbsUp className="h-16 w-16" /> : <ThumbsDown className="h-16 w-16" />}
            </div>

            <div>
              <div className={`text-5xl font-black ${isBuy ? "text-emerald-400" : "text-red-400"}`}>
                {decision.recommendation}
              </div>
              <p className="text-slate-400 text-sm mt-1">Issued by Autonomous Committee</p>
            </div>
          </div>

          {/* Confidence Indicator */}
          <div className="w-full mt-8 border-t border-slate-800/80 pt-6">
            <div className="flex justify-between items-center text-sm font-semibold mb-2">
              <span className="text-slate-400">Decision Confidence</span>
              <span className="text-white">{decision.confidence || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${isBuy ? "bg-emerald-500" : "bg-red-500"}`} 
                style={{ width: `${decision.confidence || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Executive Summary Thesis */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Executive Investment Thesis</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed justify-center text-justify">
              {decision.investmentSummary || "No detailed summary available."}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <h4 className="text-sm font-bold text-white mb-2">Decision Rationale</h4>
            <p className="text-slate-400 text-xs leading-relaxed text-justify">
              {decision.reasoning || "No rationale available."}
            </p>
          </div>
        </div>
      </div>

      {/* Pros & Cons Timeline Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Pros (Emerald) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center space-x-2 text-emerald-400 mb-6">
            <ThumbsUp className="h-5 w-5" />
            <h3 className="text-lg font-bold">Key Catalysts & Strengths</h3>
          </div>
          <ul className="space-y-4">
            {decision.pros && decision.pros.map((pro, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm">
                <span className="flex h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold justify-center items-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-slate-300 leading-relaxed">{pro}</span>
              </li>
            ))}
            {(!decision.pros || decision.pros.length === 0) && (
              <li className="text-slate-500 text-sm">No positive catalysts identified.</li>
            )}
          </ul>
        </div>

        {/* Cons (Red) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center space-x-2 text-red-400 mb-6">
            <ThumbsDown className="h-5 w-5" />
            <h3 className="text-lg font-bold">Key Vulnerabilities & Concerns</h3>
          </div>
          <ul className="space-y-4">
            {decision.cons && decision.cons.map((con, index) => (
              <li key={index} className="flex items-start space-x-3 text-sm">
                <span className="flex h-5 w-5 rounded-full bg-red-500/10 text-red-400 font-bold justify-center items-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-slate-300 leading-relaxed">{con}</span>
              </li>
            ))}
            {(!decision.cons || decision.cons.length === 0) && (
              <li className="text-slate-500 text-sm">No major vulnerabilities identified.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Business Model Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-6">
          <HelpCircle className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Business Model & Positioning</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-200">Company Operations Summary</h4>
            <p className="text-slate-300 leading-relaxed text-justify">
              {research.summary || "No overview available."}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-200">Revenue Drivers</h4>
            <p className="text-slate-300 leading-relaxed text-justify">
              {research.businessModel || "No core business model overview available."}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Metrics & Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-6">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Financial Ratios & Balance Sheet</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Metric Blocks */}
          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            {[
              ["Market Cap", financials.metrics?.marketCap || "N/A"],
              ["Revenue Status", financials.metrics?.revenue || "N/A"],
              ["Profit Status", financials.metrics?.profit || "N/A"],
              ["Free Cash Flow", financials.metrics?.cashFlow || "N/A"],
              ["Growth Indicator", financials.metrics?.growth || "N/A"],
              ["Debt Level", financials.metrics?.debt || "N/A"],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-bold text-white mt-1 leading-snug">{val}</span>
              </div>
            ))}
          </div>

          {/* Ratios and Financial Health */}
          <div className="lg:col-span-2 bg-slate-950/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                ["P/E Ratio", financials.valuationRatios?.peRatio || "N/A"],
                ["EPS", financials.valuationRatios?.eps || "N/A"],
                ["Net Margin", financials.valuationRatios?.profitMargin || "N/A"],
                ["Debt-to-Equity", financials.valuationRatios?.debtEquityRatio || "N/A"],
              ].map(([label, val]) => (
                <div key={label} className="text-center md:text-left">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{val}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-850 pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Health Rating:</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                  financials.financialHealth?.rating === "Strong" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : financials.financialHealth?.rating === "Weak"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                }`}>
                  {financials.financialHealth?.rating || "N/A"}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed text-justify">
                {financials.financialHealth?.reasoning || "No detailed metrics reasoning provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Profile Section & Radar Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-6">
          <ShieldAlert className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Risk Matrix Analysis</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Radar Chart */}
          <div className="lg:col-span-1 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px]">
            <span className="text-xs font-bold text-slate-400 mb-4 uppercase">Risk Footprint Map</span>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={riskChartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#475569" fontSize={9} />
                  <Radar name="Risk Level" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center space-x-2 mt-4 text-sm font-semibold">
              <span className="text-slate-400">Composite Score:</span>
              <span className={`text-base font-bold ${
                risks.riskScore >= 7 ? "text-red-400" : risks.riskScore >= 4 ? "text-yellow-400" : "text-emerald-400"
              }`}>{risks.riskScore || 5}/10 ({risks.riskRating || "Medium"})</span>
            </div>
          </div>

          {/* Detailed Risk Table */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed text-justify">
              {risks.reasoning || "No detailed risk overview provided."}
            </p>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-slate-950/70 p-3 font-bold border-b border-slate-850 text-slate-400 uppercase tracking-wider">
                <div>Risk Category</div>
                <div className="text-center">Score</div>
                <div>Focus Details</div>
              </div>
              <div className="divide-y divide-slate-850">
                {Object.keys(riskCategories).map(key => {
                  const cat = riskCategories[key] || {};
                  return (
                    <div key={key} className="grid grid-cols-3 p-3 items-center text-slate-300">
                      <div className="font-bold text-white capitalize">{key}</div>
                      <div className="text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                          parseFloat(cat.score) >= 7 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : parseFloat(cat.score) >= 4
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {cat.score || "5"}/10
                        </span>
                      </div>
                      <div className="text-slate-400">{cat.details || "N/A"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Sentiment Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart2 className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Sentiment & News Intelligence</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sentiment Distribution */}
          <div className="lg:col-span-1 bg-slate-950/40 border border-slate-850 rounded-2xl p-6 flex flex-col items-center justify-between min-h-[300px]">
            <span className="text-xs font-bold text-slate-400 mb-4 uppercase">News Sentiment Profile</span>
            
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center mt-4">
              <span className="text-xs text-slate-400">Overall Rating:</span>
              <div className="text-lg font-bold text-white mt-0.5">
                {news.newsSentiment?.rating || "Neutral"} ({news.newsSentiment?.score || 50}/100)
              </div>
            </div>
          </div>

          {/* Top News Articles */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Impactful News Summary</span>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 divide-y divide-slate-850">
              {news.topEvents && news.topEvents.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-bold text-white hover:text-emerald-400 transition-colors leading-tight">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                          <span>{item.headline}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 inline shrink-0" />
                        </a>
                      ) : (
                        item.headline
                      )}
                    </h4>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 ${
                      item.sentiment === "Positive" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : item.sentiment === "Negative"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-slate-800 text-slate-400"
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed text-justify">
                    {item.summary}
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span>Source: {item.source || "Web"}</span>
                  </div>
                </div>
              ))}
              {(!news.topEvents || news.topEvents.length === 0) && (
                <div className="text-slate-500 text-sm py-4">No recent articles categorized.</div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default DashboardView;
