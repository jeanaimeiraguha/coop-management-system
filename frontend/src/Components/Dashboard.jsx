// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalSavings: 0,
    totalLoans: 0,
  });

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await api.get("/profits/summary");
        setSummary(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSummary();
  }, []);

  const data = {
    labels: ["Total Savings", "Total Loans"],
    datasets: [
      {
        label: "Amount (RWF)",
        data: [summary.totalSavings, summary.totalLoans],
        backgroundColor: ["#4f46e5", "#f59e0b"],
      },
    ],
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Total Savings
            </h2>
            <p className="text-3xl font-bold text-green-600">
              {summary.totalSavings.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Total Loans Approved
            </h2>
            <p className="text-3xl font-bold text-red-600">
              {summary.totalLoans.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <Bar data={data} />
        </div>
      </div>
    </div>
  );
}
