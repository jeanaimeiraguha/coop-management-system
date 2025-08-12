// src/components/Repayments.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Repayments({ loanId }) {
  const [repayments, setRepayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  async function loadRepayments() {
    try {
      const res = await api.get(`/loans/${loanId}/repayments`);
      setRepayments(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (loanId) loadRepayments();
  }, [loanId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/loans/${loanId}/repayments`, { amount: Number(amount) });
      setAmount("");
      loadRepayments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add repayment");
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Repayments</h2>
      {error && (
        <p className="text-red-600 font-semibold mb-4 text-center">{error}</p>
      )}
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          type="number"
          min="1"
          required
          placeholder="Amount (RWF)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-grow p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 rounded hover:bg-indigo-700 transition"
        >
          Add
        </button>
      </form>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-indigo-100">
          <tr>
            <th className="p-3 border border-gray-300">Date</th>
            <th className="p-3 border border-gray-300">Amount (RWF)</th>
          </tr>
        </thead>
        <tbody>
          {repayments.length === 0 && (
            <tr>
              <td
                colSpan="2"
                className="p-4 text-center text-gray-500 italic font-semibold"
              >
                No repayments recorded.
              </td>
            </tr>
          )}
          {repayments.map((r) => (
            <tr
              key={r.id}
              className="hover:bg-indigo-50 transition cursor-pointer"
            >
              <td className="p-3 border border-gray-300">
                {new Date(r.date).toLocaleDateString()}
              </td>
              <td className="p-3 border border-gray-300 font-semibold">
                {r.amount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
