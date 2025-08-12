// src/pages/Loans.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import LoanApplyForm from "../components/LoanApplyForm";
import LoanList from "../components/LoanList";
import api from "../services/api";

export default function Loans() {
  const [loans, setLoans] = useState([]);

  async function loadLoans() {
    try {
      const res = await api.get("/loans");
      setLoans(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadLoans();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">Loans</h1>
        <LoanApplyForm onApplied={loadLoans} />
        <LoanList loans={loans} />
      </div>
    </div>
  );
}
