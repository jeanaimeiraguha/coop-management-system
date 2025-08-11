import React from "react";

export default function Dashboard() {
  const name = localStorage.getItem("memberName") || "Member";
  const email = localStorage.getItem("memberEmail");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const isAdmin = email === "admin@example.com";

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {name}!</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <a href="/contributions" className="block bg-purple-600 hover:bg-purple-700 text-white p-6 rounded text-center">
          Contributions & Savings
        </a>

        <a href="/loans" className="block bg-blue-600 hover:bg-blue-700 text-white p-6 rounded text-center">
          My Loans
        </a>

        {isAdmin && (
          <>
            <a href="/loans/pending" className="block bg-green-600 hover:bg-green-700 text-white p-6 rounded text-center">
              Pending Loan Approvals
            </a>

            <a href="/profits" className="block bg-yellow-600 hover:bg-yellow-700 text-white p-6 rounded text-center">
              Profit Summary
            </a>
          </>
        )}
      </div>

      <button
        onClick={logout}
        className="mt-8 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
