import { useEffect, useState } from "react";
import axios from "axios";

export default function ContributionList() {
  const [contributions, setContributions] = useState([]);

  const fetchContributions = async () => {
    const res = await axios.get("http://localhost:3000/contributions", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setContributions(res.data);
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-bold mb-4">Contributions</h3>
      <ul>
        {contributions.map((c) => (
          <li key={c.id} className="border-b py-2">
            {c.amount} RWF — {new Date(c.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
