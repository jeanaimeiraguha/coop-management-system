// Member Loan Tracking & Approval - Single-file React + Tailwind app
// Instructions: Install dependencies before running:
// npm install react-router-dom framer-motion recharts axios
// Tailwind must be configured in your project (postcss/tailwindcss). This file is a ready-to-drop App component.

import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ----------------------- Context & Mock API ----------------------- */
const AppContext = createContext();

const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

// mock SMS send (frontend only): you should call your backend endpoint to send real SMS
async function mockSendSMS(phone, message) {
  console.log("[mockSendSMS] to", phone, message);
  return new Promise((res) => setTimeout(() => res({ success: true }), 800));
}

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {}
  }, [key, state]);
  return [state, setState];
}

/* ----------------------- Sample Data ----------------------- */
const sampleMembers = [
  { id: 1, name: "Alice N.", phone: "+250788000111", share: 40 },
  { id: 2, name: "Bruno K.", phone: "+250788000222", share: 30 },
  { id: 3, name: "Celine M.", phone: "+250788000333", share: 20 },
  { id: 4, name: "Daniel T.", phone: "+250788000444", share: 10 },
];

const sampleLoans = [
  {
    id: 101,
    memberId: 1,
    amount: 1000,
    termMonths: 6,
    status: "pending",
    createdAt: new Date().toISOString(),
    repayments: [],
    note: "School fees",
  },
  {
    id: 102,
    memberId: 2,
    amount: 2000,
    termMonths: 12,
    status: "approved",
    createdAt: new Date().toISOString(),
    repayments: [ { date: new Date().toISOString(), amount: 200 } ],
    note: "Business capital",
  },
];

/* ----------------------- App Provider ----------------------- */
export default function App() {
  // persisted state
  const [members, setMembers] = useLocalState("mla_members", sampleMembers);
  const [loans, setLoans] = useLocalState("mla_loans", sampleLoans);
  const [profitRecords, setProfitRecords] = useLocalState("mla_profits", [
    { year: 2024, totalProfit: 12000 },
    { year: 2025, totalProfit: 8500 },
  ]);

  // helper: add loan
  function addLoan(loan) {
    setLoans((prev) => [loan, ...prev]);
  }

  function updateLoan(updated) {
    setLoans((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  function addRepayment(loanId, repayment) {
    setLoans((prev) => prev.map((l) => {
      if (l.id !== loanId) return l;
      return { ...l, repayments: [...(l.repayments || []), repayment] };
    }));
  }

  const ctx = {
    members,
    setMembers,
    loans,
    addLoan,
    updateLoan,
    addRepayment,
    profitRecords,
    setProfitRecords,
    sendSMS: mockSendSMS,
  };

  return (
    <AppContext.Provider value={ctx}>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-800">
          <Navbar />
          <main className="max-w-6xl mx-auto p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/apply" element={<LoanApply />} />
              <Route path="/committee" element={<CommitteeReview />} />
              <Route path="/repayments" element={<RepaymentTracker />} />
              <Route path="/profit" element={<ProfitCalculator />} />
              <Route path="/savings" element={<SavingsMonitor />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

/* ----------------------- Navbar ----------------------- */
function Navbar() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold">ML</div>
          <div>
            <h1 className="font-semibold">Member Loan & Savings</h1>
            <p className="text-xs text-gray-500">Loan Tracking · Profit Distribution · Savings</p>
          </div>
        </Link>
        <nav className="flex gap-2 items-center">
          <NavLink to="/apply">Apply</NavLink>
          <NavLink to="/committee">Committee</NavLink>
          <NavLink to="/repayments">Repayments</NavLink>
          <NavLink to="/profit">Profit</NavLink>
          <NavLink to="/savings">Savings</NavLink>
        </nav>
      </div>
    </header>
  );
}
function NavLink({ to, children }) {
  return (
    <Link to={to} className="px-3 py-2 rounded-md text-sm hover:bg-gray-100">
      {children}
    </Link>
  );
}

/* ----------------------- Dashboard ----------------------- */
function Dashboard() {
  const { loans, members } = useContext(AppContext);
  const pending = loans.filter((l) => l.status === "pending").length;
  const approved = loans.filter((l) => l.status === "approved").length;
  const totalOutstanding = loans.reduce((s, l) => {
    const repaid = (l.repayments || []).reduce((r, p) => r + p.amount, 0);
    return s + Math.max(0, l.amount - repaid);
  }, 0);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-4">
        <Card title="Pending Requests" value={pending} />
        <Card title="Approved Loans" value={approved} />
        <Card title="Outstanding (USD)" value={`$${totalOutstanding}`} />
      </motion.div>

      <section className="mt-6 grid md:grid-cols-2 gap-4">
        <RecentLoans />
        <MembersList />
      </section>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow flex flex-col gap-2">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function RecentLoans() {
  const { loans, members } = useContext(AppContext);
  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <h3 className="font-semibold">Recent Loan Requests</h3>
      <ul className="mt-3 space-y-2">
        {loans.slice(0, 6).map((l) => (
          <li key={l.id} className="p-2 rounded-md border flex justify-between items-center">
            <div>
              <div className="font-medium">Loan #{l.id} — ${l.amount}</div>
              <div className="text-xs text-gray-500">{members.find((m) => m.id === l.memberId)?.name ?? "Unknown"} • {l.status}</div>
            </div>
            <div className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MembersList() {
  const { members } = useContext(AppContext);
  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <h3 className="font-semibold">Members</h3>
      <div className="mt-3 grid gap-2">
        {members.map((m) => (
          <div key={m.id} className="p-2 rounded-md border flex items-center justify-between">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-gray-500">Shares: {m.share}%</div>
            </div>
            <div className="text-xs text-gray-500">{m.phone}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Loan Apply ----------------------- */
function LoanApply() {
  const { members, addLoan } = useContext(AppContext);
  const [form, setForm] = useState({ memberId: members[0]?.id || 1, amount: "", termMonths: 6, note: "" });
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    const newLoan = {
      id: Math.floor(Date.now() / 1000),
      memberId: Number(form.memberId),
      amount: Number(form.amount),
      termMonths: Number(form.termMonths),
      status: "pending",
      createdAt: new Date().toISOString(),
      repayments: [],
      note: form.note,
    };
    addLoan(newLoan);
    navigate("/");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Apply for a Loan</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <div className="text-sm text-gray-600">Member</div>
            <select value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} className="w-full mt-1 p-2 border rounded">
              {members.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.phone}</option>)}
            </select>
          </label>

          <label className="block">
            <div className="text-sm text-gray-600">Amount (USD)</div>
            <input required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" className="w-full mt-1 p-2 border rounded" />
          </label>

          <label className="block">
            <div className="text-sm text-gray-600">Term (Months)</div>
            <input value={form.termMonths} onChange={(e) => setForm({ ...form, termMonths: e.target.value })} type="number" className="w-full mt-1 p-2 border rounded" />
          </label>

          <label className="block">
            <div className="text-sm text-gray-600">Purpose / Note</div>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full mt-1 p-2 border rounded" />
          </label>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:opacity-90">Submit Request</button>
            <Link to="/" className="px-4 py-2 border rounded">Cancel</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ----------------------- Committee Review ----------------------- */
function CommitteeReview() {
  const { loans, updateLoan, members, sendSMS } = useContext(AppContext);

  async function handleDecision(loan, decision) {
    const updated = { ...loan, status: decision };
    updateLoan(updated);
    const member = members.find((m) => m.id === loan.memberId);
    if (member) {
      await sendSMS(member.phone, `Your loan #${loan.id} has been ${decision}.`);
      alert(`SMS sent to ${member.phone}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-semibold text-xl mb-3">Committee — Review Requests</h2>
      <div className="grid gap-3">
        {loans.map((l) => (
          <div key={l.id} className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
            <div>
              <div className="font-medium">Loan #{l.id} — ${l.amount}</div>
              <div className="text-xs text-gray-500">Member: {members.find((m) => m.id === l.memberId)?.name}</div>
              <div className="text-xs text-gray-500">Purpose: {l.note}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{l.status}</div>
              {l.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleDecision(l, "approved")} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                  <button onClick={() => handleDecision(l, "rejected")} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Repayment Tracker ----------------------- */
function RepaymentTracker() {
  const { loans, addRepayment, members, sendSMS } = useContext(AppContext);
  const [selected, setSelected] = useState(loans[0]?.id || null);
  const loan = loans.find((l) => l.id === selected) || null;
  const [amount, setAmount] = useState(0);

  function submitPayment(e) {
    e.preventDefault();
    if (!loan) return;
    const rep = { date: new Date().toISOString(), amount: Number(amount) };
    addRepayment(loan.id, rep);
    const member = members.find((m) => m.id === loan.memberId);
    if (member) sendSMS(member.phone, `Payment received $${rep.amount} for loan #${loan.id}`);
    setAmount(0);
    alert("Repayment recorded (mock)");
  }

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold">Select Loan</h3>
        <select value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))} className="mt-2 w-full p-2 border rounded">
          {loans.map((l) => (
            <option key={l.id} value={l.id}>{`#${l.id} • ${members.find(m => m.id === l.memberId)?.name} • $${l.amount} • ${l.status}`}</option>
          ))}
        </select>

        {loan && (
          <div className="mt-4">
            <div className="text-sm text-gray-600">Outstanding:</div>
            <div className="text-lg font-semibold">$ {loan.amount - (loan.repayments || []).reduce((s,p)=>s+p.amount,0)}</div>

            <form onSubmit={submitPayment} className="mt-4 space-y-2">
              <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full p-2 border rounded" placeholder="Payment amount" />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded">Record Payment</button>
                <button type="button" onClick={() => {
                  // Quick reminder: sends SMS reminding member to pay next installment (mock)
                  const member = members.find((m) => m.id === loan.memberId);
                  if (member) {
                    sendSMS(member.phone, `Reminder: please repay your loan #${loan.id}. Outstanding: $${loan.amount - (loan.repayments || []).reduce((s,p)=>s+p.amount,0)}`)
                      .then(()=>alert('Reminder (mock) sent'));
                  }
                }} className="px-4 py-2 border rounded">Send Reminder</button>
              </div>
            </form>

            <div className="mt-4">
              <h4 className="font-medium">Repayment History</h4>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {(loan.repayments || []).slice().reverse().map((r, i) => (
                  <li key={i}>{new Date(r.date).toLocaleDateString()} — ${r.amount}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold">All Loans Overview</h3>
        <div className="mt-3 space-y-2">
          {loans.map(l => (
            <div key={l.id} className="p-2 border rounded flex justify-between">
              <div>
                <div className="font-medium">#{l.id} — ${l.amount}</div>
                <div className="text-xs text-gray-500">{members.find(m=>m.id===l.memberId)?.name} • {l.status}</div>
              </div>
              <div className="text-sm">Outstanding: ${l.amount - (l.repayments||[]).reduce((s,p)=>s+p.amount,0)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Profit Distribution ----------------------- */
function ProfitCalculator() {
  const { profitRecords, members, setProfitRecords } = useContext(AppContext);
  const [year, setYear] = useState(new Date().getFullYear());
  const [total, setTotal] = useState(0);
  const [distribution, setDistribution] = useState([]);

  function compute() {
    const totalShares = members.reduce((s, m) => s + (m.share || 0), 0) || 1;
    const dist = members.map((m) => ({ name: m.name, share: m.share, amount: Math.round((m.share / totalShares) * total) }));
    setDistribution(dist);
  }

  function saveRecord() {
    setProfitRecords(prev => [{ year, totalProfit: total, distributedAt: new Date().toISOString(), distribution }, ...prev]);
    alert('Saved profit record');
  }

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold">Profit Distribution Calculator</h3>
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-sm text-gray-600">Year</label>
            <input type="number" value={year} onChange={(e)=>setYear(Number(e.target.value))} className="w-full p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Total Profit (USD)</label>
            <input type="number" value={total} onChange={(e)=>setTotal(Number(e.target.value))} className="w-full p-2 border rounded mt-1" />
          </div>
          <div className="flex gap-2">
            <button onClick={compute} className="px-4 py-2 bg-indigo-600 text-white rounded">Compute</button>
            <button onClick={saveRecord} className="px-4 py-2 border rounded">Save Record</button>
          </div>

          {distribution.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium">Distribution</h4>
              <div className="mt-2 grid gap-2">
                {distribution.map((d, i) => (
                  <div key={i} className="flex justify-between p-2 border rounded">
                    <div>{d.name} — {d.share}%</div>
                    <div className="font-semibold">${d.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow">
        <h3 className="font-semibold">Visualization</h3>
        {distribution.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={distribution} dataKey="amount" nameKey="name" outerRadius={80} label>
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-sm text-gray-500 mt-4">Compute distribution to show a chart.</div>
        )}

        <div className="mt-4">
          <h4 className="font-medium">Saved Profit Records</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {profitRecords.map((r, i) => (
              <li key={i} className="p-2 border rounded">{r.year} — ${r.totalProfit} • {new Date(r.distributedAt || r.createdAt || Date.now()).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Savings Monitor ----------------------- */
function SavingsMonitor() {
  const { members, loans } = useContext(AppContext);
  // For demo: each member's savings = sum of repaid amounts + some base
  const calculate = (m) => {
    const repaid = loans.filter(l=>l.memberId===m.id).reduce((s, l) => s + (l.repayments || []).reduce((r, p) => r + p.amount, 0), 0);
    const base = (m.share || 0) * 5; // synthetic
    return Math.round(base + repaid);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-semibold text-xl mb-3">Digital Contribution & Savings Monitoring</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="font-medium">Members & Balances</h3>
          <ul className="mt-3 space-y-2">
            {members.map(m => (
              <li key={m.id} className="p-2 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-gray-500">Shares: {m.share}% • {m.phone}</div>
                </div>
                <div className="text-lg font-semibold">${calculate(m)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="font-medium">Pending Payments</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {loans.filter(l => l.status === 'approved').map(l => {
              const paid = (l.repayments||[]).reduce((s,p)=>s+p.amount,0);
              const outstanding = l.amount - paid;
              return (
                <li key={l.id} className="p-2 border rounded flex justify-between">
                  <div>#{l.id} • {outstanding>0 ? `Outstanding $${outstanding}` : 'Paid'}</div>
                  <div className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleDateString()}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
// End of single-file app. Customize endpoints and hook to your real backend to persist data and send SMS via providers.
