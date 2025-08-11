import React, { useEffect, useState } from "react";
import api from "../api";
import { useForm } from "react-hook-form";

export default function Contributions() {
  const [history, setHistory] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const fetchContributions = async () => {
    try {
      const res = await api.get("/contributions");
      setHistory(res.data);
    } catch {
      alert("Failed to load contributions");
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const onSubmit = async data => {
    try {
      await api.post("/contributions", data);
      alert("Contribution added!");
      reset();
      fetchContributions();
    } catch {
      alert("Failed to add contribution");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Contributions</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4 max-w-sm">
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          {...register("amount", { required: true, min: 0.01 })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Note (optional)"
          {...register("note")}
          className="w-full p-2 border rounded"
        />
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
          Add Contribution
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2 text-right">Amount</th>
            <th className="border border-gray-300 p-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {history.map(c => (
            <tr key={c.id}>
              <td className="border border-gray-300 p-2">{new Date(c.date).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2 text-right">${c.amount.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{c.note || "-"}</td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr><td colSpan={3} className="text-center p-4">No contributions found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
