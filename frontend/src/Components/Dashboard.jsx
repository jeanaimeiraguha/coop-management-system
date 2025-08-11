import React from "react";

export default function Dashboard() {
  const name = localStorage.getItem("memberName") || "Member";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("memberName");
    window.location.href = "/";
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {name}!</h1>

      <div className="space-y-4">
        <a href="/contributions" className="block bg-blue-500 hover:bg-blue-600 text-white p-4 rounded">
          View & Add Contributions
        </a>
        <a href="/loans" className="block bg-green-500 hover:bg-green-600 text-white p-4 rounded">
          Apply & View Loans
        </a>
        {/* Add other links like profit reports or repayments */}
      </div>

      <button
        onClick={logout}
        className="mt-10 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
