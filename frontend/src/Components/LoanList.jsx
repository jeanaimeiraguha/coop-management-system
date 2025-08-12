// src/components/LoanList.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function LoanList({ loans }) {
  return (
    <div className="overflow-x-auto max-w-7xl mx-auto mt-6 bg-white rounded shadow-md">
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-indigo-100">
          <tr>
            <th className="p-3 border border-gray-300">Amount (RWF)</th>
            <th className="p-3 border border-gray-300">Term (Months)</th>
            <th className="p-3 border border-gray-300">Interest Rate (%)</th>
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
                No loans found.
              </td>
            </tr>
          )}
          {loans.map((loan) => (
            <tr
              key={loan.id}
              className="hover:bg-indigo-50 transition cursor-pointer"
            >
              <td className="p-3 border border-gray-300 font-semibold">
                {loan.amount.toLocaleString()}
              </td>
              <td className="p-3 border border-gray-300">{loan.termMonths}</td>
              <td className="p-3 border border-gray-300">
                {loan.interestRate.toFixed(2)}
              </td>
              <td className="p-3 border border-gray-300 capitalize">
                {loan.status}
              </td>
              <td className="p-3 border border-gray-300">
                <Link
                  to={`/loans/${loan.id}`}
                  className="text-indigo-700 hover:text-indigo-900 font-semibold"
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
