import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

const API_URL = "http://localhost:3000";

export default function Contributions() {
  const [contributions, setContributions] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const token = localStorage.getItem("token");

  const fetchContributions = async () => {
    try {
      const res = await axios.get(`${API_URL}/contributions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContributions(res.data);
    } catch (err) {
      alert("Failed to load contributions");
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const onSubmit = async (data) => {
    try {
      await axios.post(`${API_URL}/contributions`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      reset();
      fetchContributions();
    } catch (err) {
      alert("Failed to add contribution");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Your Contributions</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4 max-w-sm">
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          {...register("amount", { required: true, min: 0.01 })}
          className="w-full p-2 border rounded"
        />
        {errors.amount && <p className="text-red-500">Please enter a valid amount</p>}

        <input
          type="text"
          placeholder="Note (optional)"
          {...register("note")}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Contribution
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Date</th>
            <th className="border border-gray-300 p-2 text-right">Amount</th>
            <th className="border border-gray-300 p-2 text-left">Note</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((c) => (
            <tr key={c.id}>
              <td className="border border-gray-300 p-2">{new Date(c.date).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2 text-right">${c.amount.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{c.note || "-"}</td>
            </tr>
          ))}
          {contributions.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4">No contributions found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
