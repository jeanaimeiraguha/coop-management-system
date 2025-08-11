import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function ProfitDistribution() {
  const [profits, setProfits] = useState(null);
  const [distributions, setDistributions] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch profits and distribution data
  const fetchData = async () => {
    try {
      const resProfits = await axios.get(`${API_URL}/profits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfits(resProfits.data.totalProfit);

      const resDistributions = await axios.get(`${API_URL}/profits/distributions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDistributions(resDistributions.data);
    } catch {
      alert("Failed to fetch profit data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Yearly Profit & Dividends</h2>
      <p className="mb-4 text-lg">Total Profit: <span className="font-semibold">${profits?.toFixed(2) || "0.00"}</span></p>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Member</th>
            <th className="border border-gray-300 p-2 text-right">Contribution</th>
            <th className="border border-gray-300 p-2 text-right">Dividend Share</th>
          </tr>
        </thead>
        <tbody>
          {distributions.map((d) => (
            <tr key={d.memberId}>
              <td className="border border-gray-300 p-2">{d.memberName}</td>
              <td className="border border-gray-300 p-2 text-right">${d.contribution.toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-right">${d.dividend.toFixed(2)}</td>
            </tr>
          ))}
          {distributions.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4">No profit distribution data found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
