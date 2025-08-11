import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminLoanApproval() {
  const [pendingLoans, setPendingLoans] = useState([]);

  const fetchPendingLoans = async () => {
    try {
      const res = await api.get("/loans?status=pending");
      setPendingLoans(res.data);
    } catch {
      alert("Failed to load pending loans");
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const approveLoan = async loanId => {
    try {
      await api.put(`/loans/${loanId}/approve`);
      alert("Loan approved");
      fetchPendingLoans();
    } catch {
      alert("Failed to approve loan");
    }
  };

  const rejectLoan = async loanId => {
    try {
      await api.put(`/loans/${loanId}/reject`);
      alert("Loan rejected");
      fetchPendingLoans();
    } catch {
      alert("Failed to reject loan");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Pending Loan Approvals</h2>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Member ID</th>
            <th className="border border-gray-300 p-2 text-right">Amount</th>
            <th className="border border-gray-300 p-2 text-center">Term</th>
            <th className="border border-gray-300 p-2">Note</th>
            <th className="border border-gray-300 p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingLoans.map(loan => (
            <tr key={loan.id}>
              <td className="border border-gray-300 p-2">{loan.memberId}</td>
              <td className="border border-gray-300 p-2 text-right">${loan.amount.toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-center">{loan.termMonths} months</td>
              <td className="border border-gray-300 p-2">{loan.note || "-"}</td>
              <td className="border border-gray-300 p-2 text-center space-x-2">
                <button
                  onClick={() => approveLoan(loan.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectLoan(loan.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
          {pendingLoans.length === 0 && (
            <tr><td colSpan={5} className="text-center p-4">No pending loans</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
