import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BrainCircuit, Activity, BarChart3, ShieldAlert, Cpu, Award } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { researchCompany } from "../../services/api";

function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadingSteps = [
    "Resolving company identity & ticker details...",
    "Executing Research Agent: Compiling business overview & industry segmentation...",
    "Executing Financial Agent: Extracting balance sheet metrics & valuation ratios...",
    "Executing News Agent: Mining 30-day sentiment & summarising market events...",
    "Executing Risk Agent: Scoring competition, leverage & compliance matrices...",
    "Executing Decision Agent: Synthesizing final BUY or PASS recommendation..."
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setLoadingStep(0);

    // Simulate stepping through the LangGraph agent workflow while the backend works
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    try {
      const response = await researchCompany(query);
      clearInterval(stepInterval);
      if (response && response.success && response.data) {
        // Redirect directly to the newly generated report
        navigate(`/report/${response.data.id}`);
      } else {
        setError(response.message || "An unexpected error occurred during research.");
        setLoading(false);
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      
      const rawMsg = err.response?.data?.message || err.message || "";
      const rawMsgLower = rawMsg.toLowerCase();
      
      if (rawMsgLower.includes("429") || rawMsgLower.includes("quota") || rawMsgLower.includes("resource_exhausted")) {
        setError("API Rate Limit Exceeded: The OpenRouter API rate limit has been reached. Please wait and try again later.");
      } else if (rawMsgLower.includes("403") || rawMsgLower.includes("forbidden")) {
        setError("Data Provider Limitation: Access to the Finnhub stock profile is forbidden. This is a known API tier limitation.");
      } else if (rawMsgLower.includes("not be found") || rawMsgLower.includes("404")) {
        setError(rawMsg || "The requested company could not be resolved to any publicly traded entity.");
      } else {
        setError("An unexpected server error occurred during LangGraph multi-agent orchestration. Please try again.");
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero and Search Section */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Powered by OpenRouter & LangGraph</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
            Autonomous Multi-Agent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              Investment Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Enter a company name. Our network of specialized AI agents will analyze filings, financials, recent news, and risk vectors to produce an explainable recommendation.
          </p>

          {/* Search Box */}
          {!loading ? (
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6">
              <div className="relative flex items-center bg-slate-900 border-2 border-slate-800 focus-within:border-emerald-500 rounded-2xl p-2 transition-all shadow-xl">
                <Search className="h-6 w-6 text-slate-400 ml-3" />
                <input
                  type="text"
                  placeholder="Enter Company Name or Ticker (e.g. Nvidia, AAPL, Tesla)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-white text-base py-3 px-4 placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-md shrink-0 flex items-center space-x-2"
                >
                  <span>Research</span>
                </button>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-950/40 border border-red-800/80 text-red-300 rounded-xl text-sm text-left">
                  {error}
                </div>
              )}
            </form>
          ) : (
            /* Multi-Agent Loading Pipeline Animation */
            <div className="max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm text-left mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <BrainCircuit className="h-6 w-6 text-emerald-400 animate-spin" />
                  <span className="font-bold text-white text-lg">Running LangGraph Agents</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">{Math.round(((loadingStep + 1) / loadingSteps.length) * 100)}% Complete</span>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4">
                {loadingSteps.map((step, idx) => {
                  const isActive = idx === loadingStep;
                  const isCompleted = idx < loadingStep;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start space-x-3 transition-opacity duration-300 ${
                        isActive ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-slate-950 font-bold">✓</div>
                        ) : isActive ? (
                          <div className="h-4.5 w-4.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="h-4.5 w-4.5 rounded-full border-2 border-slate-700"></div>
                        )}
                      </div>
                      <span className={`text-sm ${isActive ? "text-emerald-400 font-medium" : "text-slate-300"}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Examples */}
          {!loading && (
            <div className="flex flex-wrap justify-center gap-2 mb-16">
              <span className="text-sm text-slate-500 self-center">Try:</span>
              {["Apple", "NVIDIA", "Tesla", "Microsoft"].map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => setQuery(ticker)}
                  className="bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 px-3 py-1 rounded-full text-xs font-mono transition-all"
                >
                  {ticker}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="bg-slate-950 border-t border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Engine Components</h2>
            <p className="text-slate-400 mt-2">Five specialized neural agents compiled as a unified directed graph</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-start text-left hover:border-emerald-500/30 transition-all">
              <Cpu className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Research Agent</h3>
              <p className="text-sm text-slate-400">Resolves business profile, sector positioning, core strengths and operational weaknesses.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-start text-left hover:border-emerald-500/30 transition-all">
              <BarChart3 className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Financial Agent</h3>
              <p className="text-sm text-slate-400">Analyzes financial data, revenue, market cap, leverage ratios, and capital metrics.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-start text-left hover:border-emerald-500/30 transition-all">
              <Activity className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">News Sentiment</h3>
              <p className="text-sm text-slate-400">Summarizes critical press and maps sentiment triggers (Positive, Negative, Neutral).</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-start text-left hover:border-emerald-500/30 transition-all">
              <ShieldAlert className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Risk Officer</h3>
              <p className="text-sm text-slate-400">Evaluates competition, leverage, technology disruption, and policy regulations.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-start text-left hover:border-emerald-500/30 transition-all">
              <Award className="h-8 w-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Decision Synthesis</h3>
              <p className="text-sm text-slate-400">Fuses prior agent findings into a recommendation with confidence scoring and pros/cons.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} AlphaLens AI. All rights reserved. Professional Grade Multi-Agent Platform.</p>
      </footer>
    </div>
  );
}

export default Home;