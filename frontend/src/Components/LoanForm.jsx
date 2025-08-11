import { useState } from "react";
import axios from "axios";

export default function LoanForm({ onSuccess }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/loans",
        { amount },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessage("✅ Loan request submitted");
      setAmount("");
      onSuccess();
    } catch {
      setMessage("❌ Failed to request loan");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-4">
      {message && <p className="mb-3">{message}</p>}
      <input
        type="number"
        placeholder="Loan Amount"
        className="border p-2 rounded w-full mb-4"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
        Request Loan
      </button>
    </form>
  );
}
