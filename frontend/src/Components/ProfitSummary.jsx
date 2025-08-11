import React, { useEffect, useState } from "react";
import api from "../api";

export default function ProfitSummary() {
  const [summary, setSummary] = useState(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/profits/summary");
      setSummary(res.data);
    } catch {
      alert("Failed to load profit summary");
    }
  };

  React.useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-2xl font-bold mb-4">Profit & Savings Summary</h2>
      {summary ? (
        <ul className="list-disc list-inside">
          <li>Total Savings: ${summary.totalSavings || 0}</li>
          <li>Total Approved Loans: ${summary.totalLoans || 0}</li>
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
