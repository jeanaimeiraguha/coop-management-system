import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);

  const fetchLoans = async () => {
    const res = await axios.get("http://localhost:3000/admin/loans", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setLoans(res.data);
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `http://localhost:3000/admin/loans/${id}`,
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    fetchLoans();
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-bold mb-4">Loan Approvals</h3>
      {loans.map((loan) => (
        <div key={loan.id} className="border-b py-2 flex justify-between">
          <span>{loan.amount} RWF — {loan.status}</span>
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus(loan.id, "approved")}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => updateStatus(loan.id, "rejected")}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
