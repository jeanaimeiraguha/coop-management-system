// CoopFinance Complex Frontend – Single-file React App
// Libraries used: react-router-dom, framer-motion, recharts, lucide-react
// Styling: Tailwind CSS (no configuration included here—see run instructions in chat)
// Notes: This is a self-contained demo with localStorage as a mock backend.
//       Replace the storage helpers with real API calls when integrating a backend.

import React, { useEffect, useMemo, useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend
} from "recharts";
import {
  LayoutDashboard, PiggyBank, HandCoins, Calculator, Users, Bell, Menu, X, Check, XCircle, Plus, LogIn, LogOut, Send, Download,
} from "lucide-react";

/* ===================== MOCK STORAGE LAYER ===================== */
const STORAGE_KEY = "coopfinance_v1";
const seed = {
  auth: { user: { id: 1, name: "Committee Admin", role: "committee" } },
  members: [
    { id: 1, name: "Aline Uwase", phone: "+250780000001", shares: 30, savings: 450000 },
    { id: 2, name: "Eric Niyigena", phone: "+250780000002", shares: 20, savings: 310000 },
    { id: 3, name: "Claudine Imanishimwe", phone: "+250780000003", shares: 50, savings: 720000 },
  ],
  contributions: [
    { id: 1, memberId: 1, date: "2025-07-01", amount: 50000 },
    { id: 2, memberId: 2, date: "2025-07-10", amount: 80000 },
    { id: 3, memberId: 3, date: "2025-07-15", amount: 120000 },
    { id: 4, memberId: 1, date: "2025-08-01", amount: 60000 },
  ],
  loans: [
    // status: pending | approved | declined | active | closed
    { id: 1, memberId: 1, amount: 300000, purpose: "School fees", termMonths: 6, rate: 0.02, status: "active", issuedOn: "2025-06-10", nextDue: "2025-09-10", balance: 180000 },
    { id: 2, memberId: 2, amount: 500000, purpose: "Business expansion", termMonths: 12, rate: 0.018, status: "pending", issuedOn: null, nextDue: null, balance: 500000 },
  ],
  repayments: [
    { id: 1, loanId: 1, date: "2025-07-10", amount: 60000 },
    { id: 2, loanId: 1, date: "2025-08-10", amount: 60000 },
  ],
  smsOutbox: [],
  settings: { baseCurrency: "RWF", smsSenderId: "COOPFIN" },
};

function readStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try { return JSON.parse(raw); } catch { return seed; }
}
function writeStore(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

/* ===================== APP CONTEXT ===================== */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

function AppProvider({ children }) {
  const [db, setDb] = useState(readStore());
  useEffect(() => { writeStore(db); }, [db]);

  // Helpers
  const memberById = (id) => db.members.find((m) => m.id === id);
  const loanById = (id) => db.loans.find((l) => l.id === id);

  const addMember = (payload) => setDb((d) => ({ ...d, members: [...d.members, { ...payload, id: Date.now() }] }));
  const updateMember = (id, patch) => setDb((d) => ({ ...d, members: d.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  const removeMember = (id) => setDb((d) => ({ ...d, members: d.members.filter((m) => m.id !== id) }));

  const addContribution = (payload) => setDb((d) => ({ ...d, contributions: [...d.contributions, { ...payload, id: Date.now() }] }));

  const applyLoan = (payload) => setDb((d) => ({ ...d, loans: [...d.loans, { ...payload, id: Date.now(), status: "pending", issuedOn: null, nextDue: null, balance: payload.amount }] }));
  const setLoanStatus = (id, status) => setDb((d) => ({ ...d, loans: d.loans.map((l) => (l.id === id ? { ...l, status } : l)) }));
  const approveLoan = (id, issuedOn, firstDue) => setDb((d) => ({ ...d, loans: d.loans.map((l) => (l.id === id ? { ...l, status: "active", issuedOn, nextDue: firstDue } : l)) }));
  const recordRepayment = (loanId, amount, date) => setDb((d) => {
    const loans = d.loans.map((l) => {
      if (l.id !== loanId) return l;
      const newBalance = Math.max(0, (l.balance ?? l.amount) - amount);
      const status = newBalance === 0 ? "closed" : l.status;
      // simplistic next due calculation: +30 days
      const nextDue = status === "closed" ? null : addDays(date, 30);
      return { ...l, balance: newBalance, status, nextDue };
    });
    const repayments = [...d.repayments, { id: Date.now(), loanId, amount, date }];
    return { ...d, loans, repayments };
  });

  const sendSMS = (to, message) => setDb((d) => ({ ...d, smsOutbox: [...d.smsOutbox, { id: Date.now(), to, message, at: new Date().toISOString() }] }));

  const value = {
    db, setDb,
    memberById, loanById,
    addMember, updateMember, removeMember,
    addContribution,
    applyLoan, setLoanStatus, approveLoan, recordRepayment,
    sendSMS,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

/* ===================== UTILS ===================== */
const fmt = new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });
function addDays(d, n) { return new Date(new Date(d).getTime() + n * 86400000).toISOString().slice(0, 10); }
function today() { return new Date().toISOString().slice(0, 10); }
function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ===================== LAYOUT ===================== */
function Shell({ children }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { db } = useApp();

  const links = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/loans", label: "Loans", icon: <HandCoins size={18} /> },
    { to: "/savings", label: "Savings", icon: <PiggyBank size={18} /> },
    { to: "/profit", label: "Profit", icon: <Calculator size={18} /> },
    { to: "/members", label: "Members", icon: <Users size={18} /> },
    { to: "/notifications", label: "Notifications", icon: <Bell size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpen((v) => !v)}>
              {open ? <X /> : <Menu />}
            </button>
            <span className="font-bold text-green-600">CoopFinance</span>
          </div>
          <div className="text-sm text-gray-500">Logged in as <b>{db.auth.user.name}</b></div>
        </div>
      </header>
      <div className="pt-14 flex">
        <AnimatePresence>
          {open && (
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-64 shrink-0 border-r bg-white min-h-[calc(100vh-3.5rem)] p-3 hidden md:block"
            >
              <nav className="space-y-1">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} end className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 ${isActive ? 'bg-green-100 text-green-700' : ''}`}>
                    {l.icon} {l.label}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ===================== REUSABLE UI ===================== */
function Card({ title, children, actions }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <div>{actions}</div>
      </div>
      {children}
    </div>
  );
}

function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[color]}`}>{children}</span>;
}

function Field({ label, children, hint, error }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm mb-1 text-gray-700">{label}</span>
      {children}
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </label>
  );
}

function Button({ children, onClick, variant = "primary", type = "button" }) {
  const styles = {
    primary: "bg-green-600 text-white hover:bg-green-700",
    secondary: "bg-white border hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button type={type} onClick={onClick} className={`px-3 py-2 rounded-lg text-sm ${styles[variant]}`}>{children}</button>
  );
}

/* ===================== DASHBOARD ===================== */
function Dashboard() {
  const { db } = useApp();
  const kpis = useMemo(() => {
    const activeLoans = db.loans.filter((l) => ["active", "pending"].includes(l.status));
    const totalSavings = db.members.reduce((s, m) => s + (m.savings || 0), 0);
    const totalOutstanding = db.loans.filter(l=>l.status!=="closed").reduce((s, l) => s + (l.balance ?? l.amount), 0);
    const members = db.members.length;
    return { activeLoans: activeLoans.length, totalSavings, totalOutstanding, members };
  }, [db]);

  const savingsSeries = useMemo(() => {
    // monthly sums from contributions
    const map = new Map();
    db.contributions.forEach((c) => {
      const key = c.date.slice(0, 7);
      map.set(key, (map.get(key) || 0) + c.amount);
    });
    return [...map.entries()].sort().map(([month, amount]) => ({ month, amount }));
  }, [db.contributions]);

  const loanStatus = useMemo(() => {
    const counts = { pending: 0, active: 0, declined: 0, closed: 0 };
    db.loans.forEach((l) => counts[l.status] = (counts[l.status] || 0) + 1);
    return [
      { name: "Pending", value: counts.pending },
      { name: "Active", value: counts.active },
      { name: "Declined", value: counts.declined },
      { name: "Closed", value: counts.closed },
    ];
  }, [db.loans]);
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]; // ok to hardcode for demo

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Active/Pending Loans"><div className="text-2xl font-bold">{kpis.activeLoans}</div></Card>
        <Card title="Total Savings"><div className="text-2xl font-bold">{fmt.format(kpis.totalSavings)}</div></Card>
        <Card title="Outstanding Balance"><div className="text-2xl font-bold">{fmt.format(kpis.totalOutstanding)}</div></Card>
        <Card title="Members"><div className="text-2xl font-bold">{kpis.members}</div></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Monthly Contributions">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={savingsSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="amount" name="RWF" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Loan Status Mix">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={loanStatus} dataKey="value" nameKey="name" outerRadius={90}>
                {loanStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ===================== LOANS ===================== */
function Loans() {
  const { db, memberById, applyLoan, setLoanStatus, approveLoan, recordRepayment, sendSMS } = useApp();
  const [tab, setTab] = useState("apply");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[
          ["apply", "Apply Loan"],
          ["review", "Committee Review"],
          ["repay", "Repayments"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3 py-2 rounded-lg text-sm border ${tab===k?'bg-green-600 text-white':'bg-white hover:bg-gray-50'}`}>{label}</button>
        ))}
      </div>
      {tab === "apply" && <LoanApply onSubmit={applyLoan} />}
      {tab === "review" && <LoanReview loans={db.loans} memberById={memberById} onSetStatus={setLoanStatus} onApprove={approveLoan} sendSMS={sendSMS} />}
      {tab === "repay" && <LoanRepay loans={db.loans} memberById={memberById} onRepay={recordRepayment} sendSMS={sendSMS} />}
    </div>
  );
}

function LoanApply({ onSubmit }) {
  const { db } = useApp();
  const [form, setForm] = useState({ memberId: db.members[0]?.id || 0, amount: 0, purpose: "", termMonths: 6, rate: 0.02 });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.memberId) e.memberId = "Select a member";
    if (form.amount <= 0) e.amount = "Amount must be > 0";
    if (!form.purpose) e.purpose = "Purpose required";
    if (form.termMonths < 1) e.termMonths = "Term must be at least 1 month";
    return e;
  };

  return (
    <Card title="Loan Application" actions={<Button onClick={() => {
      const e = validate(); setErrors(e); if (Object.keys(e).length) return;
      onSubmit({ ...form });
      alert("Loan application submitted!");
    }}>Submit</Button>}>
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Member" error={errors.memberId}>
          <select className="w-full border rounded-lg p-2" value={form.memberId} onChange={(e)=>setForm({...form, memberId:Number(e.target.value)})}>
            {db.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
        <Field label="Amount (RWF)" error={errors.amount}>
          <input type="number" className="w-full border rounded-lg p-2" value={form.amount} onChange={(e)=>setForm({...form, amount:Number(e.target.value)})} />
        </Field>
        <Field label="Term (months)" error={errors.termMonths}>
          <input type="number" className="w-full border rounded-lg p-2" value={form.termMonths} onChange={(e)=>setForm({...form, termMonths:Number(e.target.value)})} />
        </Field>
        <Field label="Monthly Interest Rate (e.g. 0.02 for 2%)">
          <input type="number" step="0.001" className="w-full border rounded-lg p-2" value={form.rate} onChange={(e)=>setForm({...form, rate:Number(e.target.value)})} />
        </Field>
        <Field label="Purpose" error={errors.purpose}>
          <input className="w-full border rounded-lg p-2" value={form.purpose} onChange={(e)=>setForm({...form, purpose:e.target.value})} />
        </Field>
      </div>
    </Card>
  );
}

function LoanReview({ loans, memberById, onSetStatus, onApprove, sendSMS }) {
  const pending = loans.filter((l) => l.status === "pending");
  return (
    <Card title="Committee Review">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Member</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Term</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="p-2">{memberById(l.memberId)?.name}</td>
                <td className="p-2">{fmt.format(l.amount)}</td>
                <td className="p-2">{l.purpose}</td>
                <td className="p-2">{l.termMonths} mo</td>
                <td className="p-2 flex gap-2">
                  <Button variant="secondary" onClick={() => onSetStatus(l.id, "declined")}><XCircle className="inline mr-1" size={14}/>Decline</Button>
                  <Button onClick={() => {
                    const issue = today();
                    const firstDue = addDays(issue, 30);
                    onApprove(l.id, issue, firstDue);
                    sendSMS(memberById(l.memberId).phone, `Your loan of ${fmt.format(l.amount)} is approved. First due: ${firstDue}.`);
                    alert("Approved & SMS queued");
                  }}><Check className="inline mr-1" size={14}/>Approve</Button>
                </td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr><td className="p-3 text-gray-500" colSpan={5}>No pending applications.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function LoanRepay({ loans, memberById, onRepay, sendSMS }) {
  const active = loans.filter((l) => ["active"].includes(l.status));
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(today());

  return (
    <Card title="Record Repayment">
      <div className="space-y-4">
        {active.map((l) => (
          <div key={l.id} className="border rounded-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="font-medium">{memberById(l.memberId)?.name}</div>
              <div className="text-sm text-gray-600">Balance: {fmt.format(l.balance ?? l.amount)} • Next due: {l.nextDue || "-"}</div>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Amount" className="border rounded-lg p-2 w-40" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} />
              <input type="date" className="border rounded-lg p-2" value={date} onChange={(e)=>setDate(e.target.value)} />
              <Button onClick={() => {
                if (amount <= 0) return alert("Enter a valid amount");
                onRepay(l.id, amount, date);
                sendSMS(memberById(l.memberId).phone, `Payment received: ${fmt.format(amount)} on ${date}. Thank you!`);
                setAmount(0);
                alert("Repayment recorded & SMS queued");
              }}>Record</Button>
            </div>
          </div>
        ))}
        {active.length === 0 && <div className="text-gray-500">No active loans.</div>}
      </div>
    </Card>
  );
}

/* ===================== SAVINGS ===================== */
function Savings() {
  const { db, addContribution, updateMember } = useApp();
  const [form, setForm] = useState({ memberId: db.members[0]?.id || 0, date: today(), amount: 0 });

  return (
    <div className="space-y-6">
      <Card title="Add Contribution" actions={<Button onClick={() => {
        if (!form.memberId || form.amount <= 0) return alert("Fill all fields");
        addContribution({ ...form, amount: Number(form.amount) });
        const member = db.members.find(m => m.id === Number(form.memberId));
        updateMember(member.id, { savings: (member.savings || 0) + Number(form.amount) });
        alert("Contribution added");
      }}>Save</Button>}>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Member">
            <select className="w-full border rounded-lg p-2" value={form.memberId} onChange={(e)=>setForm({...form, memberId:Number(e.target.value)})}>
              {db.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" className="w-full border rounded-lg p-2" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} />
          </Field>
          <Field label="Amount (RWF)">
            <input type="number" className="w-full border rounded-lg p-2" value={form.amount} onChange={(e)=>setForm({...form, amount:e.target.value})} />
          </Field>
        </div>
      </Card>

      <Card title="Balances">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">Member</th><th className="p-2">Shares</th><th className="p-2">Savings</th></tr></thead>
            <tbody>
              {db.members.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="p-2">{m.name}</td>
                  <td className="p-2">{m.shares}</td>
                  <td className="p-2">{fmt.format(m.savings || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Contribution History">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">Date</th><th className="p-2">Member</th><th className="p-2">Amount</th></tr></thead>
            <tbody>
              {db.contributions.slice().reverse().map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">{c.date}</td>
                  <td className="p-2">{db.members.find(m=>m.id===c.memberId)?.name}</td>
                  <td className="p-2">{fmt.format(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ===================== PROFIT DISTRIBUTION ===================== */
function Profit() {
  const { db } = useApp();
  const [mode, setMode] = useState("shares"); // shares | contributions
  const [totalProfit, setTotalProfit] = useState(2000000);
  const [year, setYear] = useState(2025);

  const baseTotals = useMemo(() => {
    if (mode === "shares") {
      const t = db.members.reduce((s, m) => s + (m.shares || 0), 0);
      return { total: t, entries: db.members.map(m => ({ id: m.id, name: m.name, value: m.shares || 0 })) };
    }
    // contributions mode: sum by member
    const map = new Map();
    db.contributions.forEach((c) => map.set(c.memberId, (map.get(c.memberId) || 0) + c.amount));
    const entries = db.members.map((m) => ({ id: m.id, name: m.name, value: map.get(m.id) || 0 }));
    const total = entries.reduce((s, e) => s + e.value, 0);
    return { total, entries };
  }, [mode, db]);

  const distribution = useMemo(() => {
    const rows = baseTotals.entries.map((e) => ({ ...e, percent: baseTotals.total ? (e.value / baseTotals.total) : 0 }));
    return rows.map((r) => ({ ...r, dividend: Math.round(r.percent * totalProfit) }));
  }, [baseTotals, totalProfit]);

  const download = () => {
    downloadCSV(`profit_${year}_${mode}.csv`, [
      ["Member", "BaseValue", "Percent", "Dividend(RWF)"],
      ...distribution.map((d) => [d.name, d.value, (d.percent*100).toFixed(2)+"%", d.dividend])
    ]);
  };

  return (
    <div className="space-y-6">
      <Card title="Dividend Parameters" actions={<Button onClick={download}><Download className="inline mr-1" size={14}/>Export CSV</Button>}>
        <div className="grid md:grid-cols-4 gap-4">
          <Field label="Calculation Basis">
            <select className="border rounded-lg p-2 w-full" value={mode} onChange={(e)=>setMode(e.target.value)}>
              <option value="shares">Shares</option>
              <option value="contributions">Contributions</option>
            </select>
          </Field>
          <Field label="Total Profit (RWF)">
            <input type="number" className="border rounded-lg p-2 w-full" value={totalProfit} onChange={(e)=>setTotalProfit(Number(e.target.value)||0)} />
          </Field>
          <Field label="Financial Year">
            <input type="number" className="border rounded-lg p-2 w-full" value={year} onChange={(e)=>setYear(Number(e.target.value)||year)} />
          </Field>
        </div>
      </Card>

      <Card title="Distribution Preview">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b"><th className="p-2">Member</th><th className="p-2">Base</th><th className="p-2">% Share</th><th className="p-2">Dividend</th></tr>
            </thead>
            <tbody>
              {distribution.map((d) => (
                <tr key={d.id} className="border-b">
                  <td className="p-2">{d.name}</td>
                  <td className="p-2">{mode==="shares"? d.value : fmt.format(d.value)}</td>
                  <td className="p-2">{(d.percent*100).toFixed(2)}%</td>
                  <td className="p-2">{fmt.format(d.dividend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ===================== MEMBERS ===================== */
function Members() {
  const { db, addMember, updateMember, removeMember } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", shares: 0, savings: 0 });

  return (
    <div className="space-y-6">
      <Card title="Add Member" actions={<Button onClick={() => {
        if (!form.name || !form.phone) return alert("Name & phone required");
        addMember({ ...form, shares: Number(form.shares)||0, savings: Number(form.savings)||0 });
        setForm({ name: "", phone: "", shares: 0, savings: 0 });
      }}><Plus className="inline mr-1" size={14}/>Add</Button>}>
        <div className="grid md:grid-cols-4 gap-4">
          <Field label="Name"><input className="border rounded-lg p-2 w-full" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/></Field>
          <Field label="Phone"><input className="border rounded-lg p-2 w-full" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})}/></Field>
          <Field label="Shares"><input type="number" className="border rounded-lg p-2 w-full" value={form.shares} onChange={(e)=>setForm({...form, shares:e.target.value})}/></Field>
          <Field label="Opening Savings (RWF)"><input type="number" className="border rounded-lg p-2 w-full" value={form.savings} onChange={(e)=>setForm({...form, savings:e.target.value})}/></Field>
        </div>
      </Card>

      <Card title="Member List">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Shares</th><th className="p-2">Savings</th><th className="p-2">Actions</th></tr></thead>
            <tbody>
              {db.members.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="p-2">{m.name}</td>
                  <td className="p-2">{m.phone}</td>
                  <td className="p-2">{m.shares}</td>
                  <td className="p-2">{fmt.format(m.savings || 0)}</td>
                  <td className="p-2 flex gap-2">
                    <Button variant="secondary" onClick={() => {
                      const shares = Number(prompt("Update shares", m.shares));
                      if (!Number.isNaN(shares)) updateMember(m.id, { shares });
                    }}>Edit</Button>
                    <Button variant="danger" onClick={() => removeMember(m.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ===================== NOTIFICATIONS (SMS) ===================== */
function Notifications() {
  const { db, memberById, sendSMS } = useApp();
  const [template, setTemplate] = useState("Hello {{name}}, your next loan payment is due on {{due}}. Amount: {{amount}}. - {{senderId}}");
  const [loanId, setLoanId] = useState(db.loans.find(l=>l.status!=="closed")?.id || 0);
  const loan = db.loans.find(l=>l.id===loanId);
  const preview = useMemo(() => {
    if (!loan) return "";
    const m = memberById(loan.memberId);
    return template
      .replaceAll("{{name}}", m.name)
      .replaceAll("{{due}}", loan.nextDue || "-")
      .replaceAll("{{amount}}", fmt.format(loan.balance ?? loan.amount))
      .replaceAll("{{senderId}}", db.settings.smsSenderId);
  }, [template, loan, db.settings]);

  return (
    <div className="space-y-6">
      <Card title="Compose SMS" actions={<Button onClick={() => {
        if (!loan) return alert("Select a loan");
        const m = memberById(loan.memberId);
        sendSMS(m.phone, preview);
        alert("SMS added to outbox (simulated)");
      }}><Send className="inline mr-1" size={14}/>Send</Button>}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Select Loan">
            <select className="border rounded-lg p-2 w-full" value={loanId} onChange={(e)=>setLoanId(Number(e.target.value))}>
              {db.loans.filter(l=>l.status!=="closed").map((l)=>(
                <option key={l.id} value={l.id}>{memberById(l.memberId)?.name} • Bal {fmt.format(l.balance ?? l.amount)}</option>
              ))}
            </select>
          </Field>
          <Field label="Template">
            <textarea className="border rounded-lg p-2 w-full h-28" value={template} onChange={(e)=>setTemplate(e.target.value)} />
          </Field>
        </div>
        <div className="mt-3">
          <div className="text-sm text-gray-600 mb-1">Preview</div>
          <div className="border rounded-xl p-3 bg-gray-50 whitespace-pre-wrap">{preview}</div>
        </div>
      </Card>

      <Card title="Outbox">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">Time</th><th className="p-2">To</th><th className="p-2">Message</th></tr></thead>
            <tbody>
              {db.smsOutbox.slice().reverse().map((s)=> (
                <tr key={s.id} className="border-b align-top">
                  <td className="p-2">{new Date(s.at).toLocaleString()}</td>
                  <td className="p-2">{s.to}</td>
                  <td className="p-2">{s.message}</td>
                </tr>
              ))}
              {db.smsOutbox.length===0 && <tr><td className="p-3 text-gray-500" colSpan={3}>No messages yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ===================== APP ROOT ===================== */
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/profit" element={<Profit />} />
            <Route path="/members" element={<Members />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </Shell>
      </AppProvider>
    </BrowserRouter>
  );
}
