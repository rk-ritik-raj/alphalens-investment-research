import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import History from "../pages/History/History";
import Report from "../pages/Report/Report";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;