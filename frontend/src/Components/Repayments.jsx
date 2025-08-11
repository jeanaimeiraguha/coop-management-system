import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

const API_URL = "http://localhost:3000";

export default function Repayments() {
  const { loanId } = useParams();
  const [repayments, setRepayments] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const token = localStorage.getItem("token");

  const fetchRepayments = async () => {
    try {
      const res = await axios.get(`${API_URL}/repayments/${loanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRepayments(res.data);
    } catch {
      alert("Failed to load repayments");
    }
  };

  useEffect(() => {
    fetchRepayments();
  }, [loanId]);

  const onSubmit = async (data) => {
    try {
      await axios.post(`${API_URL}/repayments`, { loanId, ...data }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      reset();
      fetchRepayments();
    } catch {
      alert("Failed to add repayment");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Repayments for Loan #{loanId}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 max-w-sm space-y-4">
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          {...register("amount", { required: true, min: 0.01 })}
          className="w-full p-2 border rounded"
        />
        {errors.amount && <p className="text-red-500">Enter a valid amount</p>}

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Add Repayment
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Date</th>
            <th className="border border-gray-300 p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {repayments.map((r) => (
            <tr key={r.id}>
              <td className="border border-gray-300 p-2">{new Date(r.date).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2 text-right">${r.amount.toFixed(2)}</td>
            </tr>
          ))}
          {repayments.length === 0 && (
            <tr>
              <td colSpan="2" className="text-center p-4">No repayments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
