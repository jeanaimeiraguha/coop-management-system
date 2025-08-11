import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function LoanApplication() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const token = localStorage.getItem("token");

  const onSubmit = async (data) => {
    try {
      await axios.post(`${API_URL}/loans`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Loan application submitted!");
      reset();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit loan");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl mb-6 font-bold">Apply for a Loan</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="number"
          step="0.01"
          placeholder="Loan Amount"
          {...register("amount", { required: true, min: 1 })}
          className="w-full p-2 border rounded"
        />
        {errors.amount && <p className="text-red-500">Please enter a valid amount</p>}

        <input
          type="number"
          placeholder="Term (months)"
          {...register("termMonths", { required: true, min: 1 })}
          className="w-full p-2 border rounded"
        />
        {errors.termMonths && <p className="text-red-500">Please enter a valid term</p>}

        <input
          type="number"
          step="0.01"
          placeholder="Interest Rate (%)"
          {...register("interestRate", { required: true, min: 0 })}
          className="w-full p-2 border rounded"
        />
        {errors.interestRate && <p className="text-red-500">Please enter a valid interest rate</p>}

        <textarea
          placeholder="Notes (optional)"
          {...register("note")}
          className="w-full p-2 border rounded"
          rows={3}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
