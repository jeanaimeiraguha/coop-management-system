import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
// import Register from "./components/Register";
import Register from "./Components/Register";
// import Dashboard from "./components/Dashboard";
import Dashboard from "./Components/Dashboard";
// import Contributions from "./components/Contributions";
import Contributions from "./Components/Contributions";
// import Loans from "./components/Loans";
import Loans from "./Components/Loans";
// import Repayments from "./components/Repayments";
import  Repayments from "./Components/Repayments"

function App() {
  // Simple auth check via token in localStorage
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/contributions"
          element={token ? <Contributions /> : <Navigate to="/" />}
        />
        <Route
          path="/loans"
          element={token ? <Loans /> : <Navigate to="/" />}
        />
        <Route
          path="/repayments/:loanId"
          element={token ? <Repayments /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
