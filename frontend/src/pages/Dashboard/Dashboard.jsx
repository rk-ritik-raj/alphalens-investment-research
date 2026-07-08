import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Plus, Loader2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import DashboardView from "../../components/dashboard/DashboardView";
import { getHistory, getReportById } from "../../services/api";

function Dashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLatestReport() {
      try {
        const historyData = await getHistory();
        if (historyData && historyData.success && historyData.data && historyData.data.length > 0) {
          // Fetch full report details for the first (most recent) item in history
          const latestId = historyData.data[0].id;
          const reportData = await getReportById(latestId);
          if (reportData && reportData.success) {
            setReport(reportData.data);
          } else {
            setError("Failed to fetch the latest investment report details.");
          }
        } else {
          // No history reports found
          setReport(null);
        }
      } catch (err) {
        console.error(err);
        setError("Could not retrieve investment history. Check backend connection.");
      } finally {
        setLoading(false);
      }
    }

    loadLatestReport();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading latest investment report...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-800/60 p-6 rounded-2xl text-center max-w-lg mx-auto py-12 space-y-4">
            <p className="text-red-400 font-medium">{error}</p>
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl border border-slate-800 transition-all font-semibold"
            >
              <span>Back to Search</span>
            </Link>
          </div>
        ) : !report ? (
          <div className="text-center py-20 max-w-md mx-auto space-y-6">
            <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              <TrendingUp className="h-10 w-10 text-slate-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">No Research Found</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                You haven't run any equity research yet. Enter a company name on the home page to compile your first report.
              </p>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-bold transition-all shadow-md"
            >
              <Plus className="h-5 w-5" />
              <span>Analyze a Company</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-400">Latest Research Analysis</h2>
              <Link 
                to="/" 
                className="flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Analysis</span>
              </Link>
            </div>

            <DashboardView report={report} />
          </div>
        )}
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500 mt-auto">
        <p>&copy; {new Date().getFullYear()} AlphaLens AI. Professional Investment Research Dashboard.</p>
      </footer>
    </div>
  );
}

export default Dashboard;