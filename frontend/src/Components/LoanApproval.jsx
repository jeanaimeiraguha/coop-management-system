// src/pages/LoanApproval.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function LoanApproval() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadLoans() {
    setLoading(true);
    try {
      const res = await api.get("/loans");
      setLoans(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function approveLoan(id) {
    try {
      await api.put(`/loans/${id}/approve`);
      loadLoans();
    } catch (err) {
      alert("Failed to approve loan");
    }
  }

  async function rejectLoan(id) {
    try {
      await api.put(`/loans/${id}/reject`);
      loadLoans();
    } catch (err) {
      alert("Failed to reject loan");
    }
  }

  useEffect(() => {
    loadLoans();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">
          Admin Loan Approvals
        </h1>
        {loading ? (
          <p className="text-center text-gray-600">Loading loans...</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow-md">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="p-3 border border-gray-300">ID</th>
                  <th className="p-3 border border-gray-300">Member ID</th>
                  <th className="p-3 border border-gray-300">Amount (RWF)</th>
                  <th className="p-3 border border-gray-300">Status</th>
                  <th className="p-3 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-4 text-center text-gray-500 italic font-semibold"
                    >
                      No loans available.
                    </td>
                  </tr>
                )}
                {loans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-indigo-50 transition cursor-pointer"
                  >
                    <td className="p-3 border border-gray-300">{loan.id}</td>
                    <td className="p-3 border border-gray-300">{loan.memberId}</td>
                    <td className="p-3 border border-gray-300 font-semibold">
                      {loan.amount.toLocaleString()}
                    </td>
                    <td className="p-3 border border-gray-300 capitalize">
                      {loan.status}
                    </td>
                    <td className="p-3 border border-gray-300 space-x-3">
                      {loan.status === "pending" && (
                        <>
                          <button
                            onClick={() => approveLoan(loan.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectLoan(loan.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
