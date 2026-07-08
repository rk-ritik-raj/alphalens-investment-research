import React from "react";
import { Link, useLocation } from "react-router-dom";
import { TrendingUp, History, Home, Award } from "lucide-react";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-white font-extrabold text-xl tracking-wider hover:text-emerald-400 transition-colors">
              <TrendingUp className="h-6 w-6 text-emerald-400 animate-pulse" />
              <span>ALPHALENS <span className="text-emerald-400">AI</span></span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? "text-emerald-400 bg-slate-800"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              to="/history"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive("/history")
                  ? "text-emerald-400 bg-slate-800"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Research History</span>
            </Link>

            <div className="flex items-center space-x-1 text-slate-500 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
              <Award className="h-3.5 w-3.5 text-yellow-500" />
              <span className="hidden md:inline font-mono">SECURE PLATFORM</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
