// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 shadow-lg p-4 flex justify-between items-center">
      <h1 className="text-white text-xl font-bold tracking-wide">Coop Management</h1>
      <div className="space-x-4">
        <Link to="/dashboard" className="text-white hover:text-yellow-300 transition">Dashboard</Link>
        <Link to="/contributions" className="text-white hover:text-yellow-300 transition">Contributions</Link>
        <Link to="/loans" className="text-white hover:text-yellow-300 transition">Loans</Link>
        <Link to="/admin-loan-approval" className="text-white hover:text-yellow-300 transition">Admin</Link>
        <button
          onClick={logout}
          className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 transition text-black"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
