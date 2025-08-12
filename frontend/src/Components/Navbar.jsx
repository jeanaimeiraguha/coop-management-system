// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-indigo-700 text-white flex justify-between items-center px-6 py-4 shadow-md sticky top-0 z-50">
      <Link to="/dashboard" className="text-2xl font-bold tracking-wide">
        Coop Management
      </Link>
      <div className="flex items-center space-x-6">
        <Link
          to="/dashboard"
          className="hover:text-yellow-400 transition duration-200"
        >
          Dashboard
        </Link>
        <Link
          to="/contributions"
          className="hover:text-yellow-400 transition duration-200"
        >
          Contributions
        </Link>
        <Link
          to="/loans"
          className="hover:text-yellow-400 transition duration-200"
        >
          Loans
        </Link>
        {user?.email === "admin@example.com" && (
          <Link
            to="/admin-loan-approval"
            className="hover:text-yellow-400 transition duration-200"
          >
            Admin
          </Link>
        )}
        <span className="italic">{user?.name || user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-black transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
