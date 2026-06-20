import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/Layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import DailyReport from "@/pages/DailyReport";
import RiskAlert from "@/pages/RiskAlert";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daily" element={<DailyReport />} />
          <Route path="/risks" element={<RiskAlert />} />
        </Route>
      </Routes>
    </Router>
  );
}
