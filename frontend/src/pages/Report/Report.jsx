import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import DashboardView from "../../components/dashboard/DashboardView";
import { getReportById } from "../../services/api";

function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      
      setLoading(true);
      setError("");
      try {
        const response = await getReportById(id);
        if (response && response.success && response.data) {
          setReport(response.data);
        } else {
          setError(response.message || "Failed to fetch details for this report.");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to server. Make sure the backend is active.");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading compiled equity report...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-800/60 p-6 rounded-2xl text-center max-w-lg mx-auto py-12 space-y-4">
            <p className="text-red-400 font-medium">{error}</p>
            <Link 
              to="/history" 
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl border border-slate-800 transition-all font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to History</span>
            </Link>
          </div>
        ) : !report ? (
          <div className="text-center py-20 max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-bold text-white">Report Not Found</h2>
            <p className="text-sm text-slate-400">
              The requested investment analysis report ID does not exist in the database.
            </p>
            <Link 
              to="/history" 
              className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md"
            >
              <span>View History Archive</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Link 
                to="/history" 
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to History Archive</span>
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

export default Report;