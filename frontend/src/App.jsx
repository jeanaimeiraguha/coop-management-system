import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// import Login from "./components/Login";
import Login from "./Components/Login";
// import Register from "./Components/Register";
import Register from "./Components/Register";
// import Dashboard from "./Components/Dashboard";
import Dashboard from "./Components/Dashboard";
// import Contributions from "./Components/Contributions";
import Contributions from "./Components/Contributions";
// import Loans from "./Components/Loans";
import Loans from "./Components/Loans";
// import AdminLoans from "./Components/AdminLoans"; // was LoanApproval in your snippet
import AdminLoans from "./Components/AdminLoans";
function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/contributions"
            element={
              <PrivateRoute>
                <Contributions />
              </PrivateRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <PrivateRoute>
                <Loans />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-loans"
            element={
              <PrivateRoute>
                <AdminLoans />
              </PrivateRoute>
            }
          />
          {/* Add more routes here if needed */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
