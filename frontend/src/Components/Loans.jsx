import React, { useEffect, useState } from "react";
import api from "../api";
import { useForm } from "react-hook-form";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const fetchLoans = async () => {
    try {
      const res = await api.get("/loans");
      setLoans(res.data);
    } catch {
      alert("Failed to load loans");
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const onSubmit = async data => {
    try {
      await api.post("/loans", data);
      alert("Loan applied!");
      reset();
      fetchLoans();
    } catch {
      alert("Failed to apply for loan");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">My Loans</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 max-w-md space-y-4">
        <input
          type="number"
          step="0.01"
          placeholder="Loan Amount"
          {...register("amount", { required: true, min: 0.01 })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Term (months)"
          {...register("termMonths", { required: true, min: 1 })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Interest Rate (%)"
          {...register("interestRate", { required: true, min: 0 })}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Note (optional)"
          {...register("note")}
          className="w-full p-2 border rounded"
          rows={3}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Apply for Loan
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Applied Date</th>
            <th className="border border-gray-300 p-2 text-right">Amount</th>
            <th className="border border-gray-300 p-2 text-center">Term</th>
            <th className="border border-gray-300 p-2 text-right">Interest</th>
            <th className="border border-gray-300 p-2 text-center">Status</th>
            <th className="border border-gray-300 p-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {loans.map(loan => (
            <tr key={loan.id}>
              <td className="border border-gray-300 p-2">{new Date(loan.appliedDate).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2 text-right">${loan.amount.toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-center">{loan.termMonths} months</td>
              <td className="border border-gray-300 p-2 text-right">{loan.interestRate}%</td>
              <td className="border border-gray-300 p-2 text-center capitalize">{loan.status}</td>
              <td className="border border-gray-300 p-2">{loan.note || "-"}</td>
            </tr>
          ))}
          {loans.length === 0 && (
            <tr><td colSpan={6} className="text-center p-4">No loans found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
