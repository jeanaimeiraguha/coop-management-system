import React, { useEffect, useState } from "react";
import api from "../api";
import { useForm } from "react-hook-form";

export default function Repayments({ loanId }) {
  const [repayments, setRepayments] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const fetchRepayments = async () => {
    try {
      const res = await api.get(`/loans/${loanId}/repayments`);
      setRepayments(res.data);
    } catch {
      alert("Failed to load repayments");
    }
  };

  useEffect(() => {
    if (loanId) fetchRepayments();
  }, [loanId]);

  const onSubmit = async data => {
    try {
      await api.post(`/loans/${loanId}/repayments`, data);
      alert("Repayment recorded");
      reset();
      fetchRepayments();
    } catch {
      alert("Failed to add repayment");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 border rounded">
      <h3 className="text-xl font-semibold mb-4">Repayments</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 max-w-sm space-y-4">
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          {...register("amount", { required: true, min: 0.01 })}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Repayment
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {repayments.map(r => (
            <tr key={r.id}>
              <td className="border border-gray-300 p-2">{new Date(r.date).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2 text-right">${r.amount.toFixed(2)}</td>
            </tr>
          ))}
          {repayments.length === 0 && (
            <tr><td colSpan={2} className="text-center p-4">No repayments found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
