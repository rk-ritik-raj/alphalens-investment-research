import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, ArrowRight, FileText, Loader2, Calendar, Shield } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getHistory, getPDFUrl } from "../../services/api";

function History() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await getHistory();
        if (response && response.success) {
          setHistoryList(response.data || []);
        } else {
          setError(response.message || "Failed to load search history.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching analysis history from backend.");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <div className="flex items-center space-x-3">
              <HistoryIcon className="h-6 w-6 text-emerald-400" />
              <h1 className="text-2xl font-extrabold text-white">Research History</h1>
            </div>
            <span className="text-slate-400 text-sm font-mono">{historyList.length} analyses logged</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
              <p className="text-slate-400 text-sm">Loading historical reports database...</p>
            </div>
          ) : error ? (
            <div className="bg-red-950/20 border border-red-800/60 p-6 rounded-2xl text-center max-w-lg mx-auto py-8">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : historyList.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-900 rounded-3xl p-8 max-w-md mx-auto space-y-4">
              <HistoryIcon className="h-10 w-10 text-slate-600 mx-auto" />
              <h2 className="text-lg font-bold text-white">History Empty</h2>
              <p className="text-sm text-slate-400">
                You haven't generated any investment analysis reports yet. Run a search on the home page.
              </p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md mt-2"
              >
                <span>New Research Analysis</span>
              </Link>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-4 sm:p-5">Company / Ticker</th>
                      <th className="p-4 sm:p-5">Recommendation</th>
                      <th className="p-4 sm:p-5">Confidence</th>
                      <th className="p-4 sm:p-5">Risk Footprint</th>
                      <th className="p-4 sm:p-5">Analyzed Date</th>
                      <th className="p-4 sm:p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {historyList.map((item) => {
                      const isBuy = item.recommendation === "BUY";
                      return (
                        <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-4 sm:p-5 font-semibold text-white">
                            <div className="flex items-center space-x-2">
                              <span className="bg-slate-800 text-slate-300 font-mono text-xs px-2 py-0.5 rounded border border-slate-700">
                                {item.symbol || "UNKNOWN"}
                              </span>
                              <span className="truncate max-w-[150px] sm:max-w-[220px]">{item.company}</span>
                            </div>
                          </td>
                          <td className="p-4 sm:p-5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isBuy 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                              {item.recommendation}
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 font-medium font-mono text-slate-200">
                            {item.confidence}%
                          </td>
                          <td className="p-4 sm:p-5">
                            <span className={`inline-flex items-center space-x-1 text-xs font-semibold ${
                              item.riskRating === "High" ? "text-red-400" : item.riskRating === "Low" ? "text-emerald-400" : "text-yellow-400"
                            }`}>
                              <Shield className="h-3.5 w-3.5 fill-current opacity-20" />
                              <span>{item.riskRating} Risk</span>
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 text-slate-400">
                            <div className="flex items-center space-x-1.5 text-xs">
                              <Calendar className="h-3.5 w-3.5 text-slate-500" />
                              <span>{new Date(item.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}</span>
                            </div>
                          </td>
                          <td className="p-4 sm:p-5 text-right">
                            <div className="inline-flex items-center space-x-3">
                              <a
                                href={getPDFUrl(item.id)}
                                download
                                title="Download PDF Report"
                                className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
                              >
                                <FileText className="h-4.5 w-4.5" />
                              </a>
                              <Link
                                to={`/report/${item.id}`}
                                className="flex items-center space-x-1 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm"
                              >
                                <span>Open</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500 mt-auto">
        <p>&copy; {new Date().getFullYear()} AlphaLens AI. SEC Compliant Multi-Agent Logging System.</p>
      </footer>
    </div>
  );
}

export default History;