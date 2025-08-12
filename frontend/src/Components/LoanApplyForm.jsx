// src/components/LoanApplyForm.jsx
import React, { useState } from "react";
import api from "../services/api";

export default function LoanApplyForm({ onApplied }) {
  const [amount, setAmount] = useState("");
  const [termMonths, setTermMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/loans", {
        amount: Number(amount),
        termMonths: Number(termMonths),
        interestRate: Number(interestRate),
        note,
      });
      setAmount("");
      setTermMonths("");
      setInterestRate("");
      setNote("");
      if (onApplied) onApplied();
    } catch (err) {
      setError(err.response?.data?.message || "Loan application failed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md max-w-lg mx-auto space-y-4"
    >
      {error && (
        <p className="text-red-600 font-semibold text-center">{error}</p>
      )}
      <input
        type="number"
        placeholder="Amount (RWF)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1"
        required
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="number"
        placeholder="Term (months)"
        value={termMonths}
        onChange={(e) => setTermMonths(e.target.value)}
        min="1"
        required
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        type="number"
        placeholder="Interest Rate (%)"
        value={interestRate}
        onChange={(e) => setInterestRate(e.target.value)}
        min="0"
        step="0.01"
        required
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <textarea
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        rows={3}
      ></textarea>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition"
      >
        Apply for Loan
      </button>
    </form>
  );
}
