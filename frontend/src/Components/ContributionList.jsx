// src/components/ContributionList.jsx
import React from "react";

export default function ContributionList({ contributions }) {
  return (
    <div className="overflow-x-auto max-w-4xl mx-auto mt-6">
      <table className="w-full border-collapse border border-gray-300 rounded shadow-md bg-white">
        <thead className="bg-indigo-100">
          <tr>
            <th className="border border-gray-300 p-3 text-left">Date</th>
            <th className="border border-gray-300 p-3 text-left">Amount (RWF)</th>
            <th className="border border-gray-300 p-3 text-left">Note</th>
          </tr>
        </thead>
        <tbody>
          {contributions.length === 0 && (
            <tr>
              <td
                colSpan="3"
                className="text-center p-4 text-gray-500 italic font-semibold"
              >
                No contributions yet.
              </td>
            </tr>
          )}
          {contributions.map((c) => (
            <tr key={c.id} className="hover:bg-indigo-50 transition">
              <td className="border border-gray-300 p-3">
                {new Date(c.date).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 p-3 font-semibold">
                {c.amount.toLocaleString()}
              </td>
              <td className="border border-gray-300 p-3">{c.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
