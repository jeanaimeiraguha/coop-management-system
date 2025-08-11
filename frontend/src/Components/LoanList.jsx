import { useEffect, useState } from "react";
import axios from "axios";

export default function LoanList() {
  const [loans, setLoans] = useState([]);

  const fetchLoans = async () => {
    const res = await axios.get("http://localhost:3000/loans", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setLoans(res.data);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-bold mb-4">My Loans</h3>
      <ul>
        {loans.map((l) => (
          <li key={l.id} className="border-b py-2">
            {l.amount} RWF — {l.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
