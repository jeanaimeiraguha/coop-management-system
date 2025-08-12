// src/pages/Contributions.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ContributionForm from "../components/ContributionForm";
import ContributionList from "../components/ContributionList";
import api from "../services/api";

export default function Contributions() {
  const [contributions, setContributions] = useState([]);

  async function loadContributions() {
    try {
      const res = await api.get("/contributions");
      setContributions(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadContributions();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">
          Contributions
        </h1>
        <ContributionForm onAdded={loadContributions} />
        <ContributionList contributions={contributions} />
      </main>
    </div>
  );
}
