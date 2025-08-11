import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

const API_URL = "http://localhost:3000";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const token = localStorage.getItem("token");

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${API_URL}/loans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoans(res.data);
    } catch {
      alert("Failed to load loans");
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const onSubmit = async (data) => {
    try {
      await axios.post(`${API_URL}/loans`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      reset();
      fetchLoans();
    } catch {
      alert("Failed to apply for loan");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Your Loans</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 max-w-sm space-y-4">
        <input
          type="number"
          step="0.01"
          placeholder="Loan Amount"
          {...register("amount", { required: true, min: 0.01 })}
          className="w-full p-2 border rounded"
        />
        {errors.amount && <p className="text-red-500">Enter a valid amount</p>}

        <input
          type="number"
          placeholder="Term (months)"
          {...register("termMonths", { required: true, min: 1 })}
          className="w-full p-2 border rounded"
        />
        {errors.termMonths && <p className="text-red-500">Enter valid term</p>}

        <input
          type="number"
          step="0.01"
          placeholder="Interest Rate (%)"
          {...register("interestRate", { required: true, min: 0 })}
          className="w-full p-2 border rounded"
        />
        {errors.interestRate && <p className="text-red-500">Enter valid interest rate</p>}

        <input
          type="text"
          placeholder="Note (optional)"
          {...register("note")}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Apply for Loan
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Applied Date</th>
            <th className="border border-gray-300 p-2 text-right">Amount</th>
            <th className="border border-gray-300 p-2 text-left">Term (Months)</th>
            <th className="border border-gray-300 p-2 text-right">Interest (%)</th>
            <th className="border border-gray-300 p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td className="border border-gray-300 p-2">{new Date(loan.appliedDate).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2 text-right">${loan.amount.toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-center">{loan.termMonths}</td>
              <td className="border border-gray-300 p-2 text-right">{loan.interestRate.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{loan.status}</td>
            </tr>
          ))}
          {loans.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4">No loans found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
