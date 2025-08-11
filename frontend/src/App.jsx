import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Contributions from "./Components/Contributions";
import Loans from "./Components/Loans";
import Repayments from "./Components/Repayments";
import AdminLoanApproval from "./components/AdminLoanApproval";
import ProfitSummary from "./Components/ProfitSummary";

// A simple auth helper: checks for token in localStorage
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/contributions"
          element={
            <RequireAuth>
              <Contributions />
            </RequireAuth>
          }
        />
        <Route
          path="/loans"
          element={
            <RequireAuth>
              <Loans />
            </RequireAuth>
          }
        />
        <Route
          path="/loans/:loanId/repayments"
          element={
            <RequireAuth>
              <Repayments />
            </RequireAuth>
          }
        />

        {/* Admin only routes */}
        <Route
          path="/loans/pending"
          element={
            <RequireAuth>
              <AdminLoanApproval />
            </RequireAuth>
          }
        />
        <Route
          path="/profits"
          element={
            <RequireAuth>
              <ProfitSummary />
            </RequireAuth>
          }
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
