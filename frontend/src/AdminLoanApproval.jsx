import React, { useEffect, useState } from "react";
import api from "../api"; // Axios instance with JWT interceptor

export default function AdminLoanApproval() {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending loans from backend
  const fetchPendingLoans = async () => {
    try {
      setLoading(true);
      // Assuming your backend supports query param to filter pending loans
      const res = await api.get("/loans"); 
      // Filter on frontend just in case backend does not filter
      const filtered = res.data.filter(loan => loan.status === "pending");
      setPendingLoans(filtered);
    } catch (error) {
      alert("Failed to load pending loans");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  // Approve a loan by ID
  const approveLoan = async (loanId) => {
    if (!window.confirm("Are you sure you want to approve this loan?")) return;

    try {
      await api.put(`/loans/${loanId}/approve`);
      alert("Loan approved successfully");
      fetchPendingLoans();
    } catch (error) {
      alert("Failed to approve loan");
      console.error(error);
    }
  };

  // Reject a loan by ID
  const rejectLoan = async (loanId) => {
    if (!window.confirm("Are you sure you want to reject this loan?")) return;

    try {
      await api.put(`/loans/${loanId}/reject`);
      alert("Loan rejected successfully");
      fetchPendingLoans();
    } catch (error) {
      alert("Failed to reject loan");
      console.error(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-bold mb-8 text-center">Pending Loan Approvals</h2>

      {loading ? (
        <p className="text-center text-lg">Loading pending loans...</p>
      ) : pendingLoans.length === 0 ? (
        <p className="text-center text-lg">No pending loans found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3">Member ID</th>
              <th className="border border-gray-300 p-3 text-right">Amount</th>
              <th className="border border-gray-300 p-3 text-center">Term (months)</th>
              <th className="border border-gray-300 p-3">Note</th>
              <th className="border border-gray-300 p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingLoans.map(loan => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">{loan.memberId}</td>
                <td className="border border-gray-300 p-3 text-right">${loan.amount.toFixed(2)}</td>
                <td className="border border-gray-300 p-3 text-center">{loan.termMonths}</td>
                <td className="border border-gray-300 p-3">{loan.note || "-"}</td>
                <td className="border border-gray-300 p-3 text-center space-x-2">
                  <button
                    onClick={() => approveLoan(loan.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectLoan(loan.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
