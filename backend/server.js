import express from "express";
import mysql from "mysql";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
  console.log("MySQL connected");
});

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// --- Middleware to verify JWT ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// ===== MEMBER REGISTRATION =====
app.post("/members/register", async (req, res) => {
  const { email, name, phone, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO members (email, name, phone, password) VALUES (?, ?, ?, ?)";
    db.query(sql, [email, name, phone, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Member registered", memberId: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== MEMBER LOGIN =====
app.post("/members/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM members WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = results[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({ message: "Login successful", token, member: { id: user.id, name: user.name, email: user.email } });
  });
});

// ===== CONTRIBUTIONS =====

// Add contribution (protected)
app.post("/contributions", authenticateToken, (req, res) => {
  const memberId = req.user.id;
  const { amount, note } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Valid amount is required" });

  const sql = "INSERT INTO contributions (memberId, amount, note, date) VALUES (?, ?, ?, NOW())";
  db.query(sql, [memberId, amount, note], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Contribution added", contributionId: result.insertId });
  });
});

// Get member contributions (protected)
app.get("/contributions", authenticateToken, (req, res) => {
  const memberId = req.user.id;

  const sql = "SELECT * FROM contributions WHERE memberId = ? ORDER BY date DESC";
  db.query(sql, [memberId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===== LOANS =====

// Apply for loan (protected)
app.post("/loans", authenticateToken, (req, res) => {
  const memberId = req.user.id;
  const { amount, termMonths, interestRate, note } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Valid loan amount required" });
  if (!termMonths || termMonths <= 0)
    return res.status(400).json({ message: "Valid term in months required" });

  const sql = `INSERT INTO loans 
    (memberId, amount, termMonths, interestRate, note, status, appliedDate) 
    VALUES (?, ?, ?, ?, ?, 'pending', NOW())`;

  db.query(sql, [memberId, amount, termMonths, interestRate, note], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Loan applied", loanId: result.insertId });
  });
});

// Get member loans (protected)
app.get("/loans", authenticateToken, (req, res) => {
  const memberId = req.user.id;
  const sql = "SELECT * FROM loans WHERE memberId = ? ORDER BY appliedDate DESC";

  db.query(sql, [memberId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===== ADMIN: Approve or Reject loans (protected admin route) =====

// For demo, a simple admin check: check if req.user.email === admin@example.com
// In real system, you’d have a roles system.

function checkAdmin(req, res, next) {
  if (req.user.email !== "admin@example.com") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
}

app.put("/loans/:loanId/approve", authenticateToken, checkAdmin, (req, res) => {
  const { loanId } = req.params;
  const sql = "UPDATE loans SET status = 'approved', approvedDate = NOW() WHERE id = ? AND status = 'pending'";

  db.query(sql, [loanId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Loan not found or not pending" });

    res.json({ message: "Loan approved" });
  });
});

app.put("/loans/:loanId/reject", authenticateToken, checkAdmin, (req, res) => {
  const { loanId } = req.params;
  const sql = "UPDATE loans SET status = 'rejected' WHERE id = ? AND status = 'pending'";

  db.query(sql, [loanId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Loan not found or not pending" });

    res.json({ message: "Loan rejected" });
  });
});

// ===== REPAYMENTS =====

// Add repayment (protected)
app.post("/loans/:loanId/repayments", authenticateToken, (req, res) => {
  const memberId = req.user.id;
  const { loanId } = req.params;
  const { amount, date } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Valid amount is required" });

  // Check loan ownership or admin access
  const sqlCheck = "SELECT * FROM loans WHERE id = ?";

  db.query(sqlCheck, [loanId], (err, loans) => {
    if (err) return res.status(500).json({ error: err.message });
    if (loans.length === 0) return res.status(404).json({ message: "Loan not found" });

    const loan = loans[0];

    if (loan.memberId !== memberId && req.user.email !== "admin@example.com") {
      return res.status(403).json({ message: "You can only repay your own loans" });
    }

    // Insert repayment
    const sqlInsert = "INSERT INTO repayments (loanId, amount, date) VALUES (?, ?, ?)";
    db.query(sqlInsert, [loanId, amount, date || new Date()], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Repayment recorded", repaymentId: result.insertId });
    });
  });
});

// Get repayments for a loan (protected)
app.get("/loans/:loanId/repayments", authenticateToken, (req, res) => {
  const { loanId } = req.params;

  const sql = "SELECT * FROM repayments WHERE loanId = ? ORDER BY date DESC";
  db.query(sql, [loanId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ===== PROFIT DISTRIBUTION SUMMARY (admin only) =====
app.get("/profits/summary", authenticateToken, checkAdmin, (req, res) => {
  const sqlContributions = "SELECT SUM(amount) as totalSavings FROM contributions";
  const sqlLoans = "SELECT SUM(amount) as totalLoans FROM loans WHERE status = 'approved'";

  db.query(sqlContributions, (err, contribRes) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(sqlLoans, (err2, loansRes) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({
        totalSavings: contribRes[0].totalSavings || 0,
        totalLoans: loansRes[0].totalLoans || 0,
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
