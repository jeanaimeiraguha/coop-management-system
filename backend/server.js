import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function q(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function tx(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally { conn.release(); }
}

// ------------------------- src/utils/pagination.js -------------------------
export function paged(req) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

// ------------------------- src/middleware/errors.js -------------------------
export function notFound(_req, res, _next) { res.status(404).json({ message: 'Not Found' }); }
export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
}

// ------------------------- src/middleware/auth.js -------------------------
import jwt from 'jsonwebtoken';
export function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return required ? res.status(401).json({ message: 'No token' }) : next();
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
    catch { return res.status(401).json({ message: 'Invalid token' }); }
  };
}
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

// ------------------------- src/utils/profit.js -------------------------
export function computeDividends({ entries, totalProfit }) {
  const totalBase = entries.reduce((s, e) => s + Number(e.baseValue || 0), 0);
  return entries.map(e => {
    const pct = totalBase > 0 ? Number(e.baseValue || 0) / totalBase : 0;
    return { memberId: e.memberId, name: e.name, baseValue: Number(e.baseValue||0), percent: pct, dividend: Math.round(pct * totalProfit) };
  });
}

// ------------------------- src/routes/auth.js -------------------------
import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { q } from '../db.js';
const router = express.Router();

router.post('/register', async (req, res) => {
  const schema = Joi.object({ name: Joi.string().min(2).required(), email: Joi.string().email().required(), password: Joi.string().min(6).required(), role: Joi.string().valid('admin','committee','member').default('member') });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const exists = await q('SELECT id FROM users WHERE email=?', [value.email]);
  if (exists.length) return res.status(409).json({ message: 'Email already used' });
  const hash = await bcrypt.hash(value.password, 10);
  const r = await q('INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)', [value.name, value.email, hash, value.role]);
  res.status(201).json({ id: r.insertId, name: value.name, email: value.email, role: value.role });
});

router.post('/login', async (req, res) => {
  const schema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const rows = await q('SELECT id,name,email,password_hash,role FROM users WHERE email=?', [value.email]);
  if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
  const user = rows[0];
  const ok = await bcrypt.compare(value.password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', async (req,res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(200).json({ user: null });
  try { const u = jwt.verify(token, process.env.JWT_SECRET); res.json({ user: u }); }
  catch { res.status(200).json({ user: null }); }
});

export default router;

// ------------------------- src/routes/users.js -------------------------
import express from 'express';
import Joi from 'joi';
import { q } from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';
const router = express.Router();

router.get('/', auth(), requireRole('admin'), async (req,res)=>{
  const rows = await q('SELECT id,name,email,role,created_at FROM users ORDER BY id DESC');
  res.json(rows);
});

router.post('/', auth(), requireRole('admin'), async (req,res)=>{
  const schema = Joi.object({ name: Joi.string().required(), email: Joi.string().email().required(), passwordHash: Joi.string().required(), role: Joi.string().valid('admin','committee','member').required()});
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const r = await q('INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)',[value.name,value.email,value.passwordHash,value.role]);
  const row = await q('SELECT id,name,email,role,created_at FROM users WHERE id=?',[r.insertId]);
  res.status(201).json(row[0]);
});

router.put('/:id', auth(), requireRole('admin'), async (req,res)=>{
  const { id } = req.params;
  const schema = Joi.object({ name: Joi.string(), email: Joi.string().email(), role: Joi.string().valid('admin','committee','member') });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const fields=[]; const params=[];
  for (const [k,v] of Object.entries(value)) { fields.push(`${k}=?`); params.push(v); }
  if (!fields.length) return res.status(400).json({ message: 'No fields' });
  params.push(id);
  await q(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, params);
  const row = await q('SELECT id,name,email,role,created_at FROM users WHERE id=?',[id]);
  res.json(row[0]);
});

router.delete('/:id', auth(), requireRole('admin'), async (req,res)=>{
  await q('DELETE FROM users WHERE id=?',[req.params.id]);
  res.json({ success:true });
});

export default router;

// ------------------------- src/routes/members.js -------------------------
import express from 'express';
import Joi from 'joi';
import { q } from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';
import { paged } from '../utils/pagination.js';
const router = express.Router();

router.get('/', auth(), async (req,res)=>{
  const { page, pageSize, offset } = paged(req);
  const rows = await q('SELECT SQL_CALC_FOUND_ROWS * FROM members ORDER BY id DESC LIMIT ? OFFSET ?', [pageSize, offset]);
  const total = (await q('SELECT FOUND_ROWS() as t'))[0].t;
  res.json({ items: rows, page, pageSize, total });
});

router.get('/:id', auth(), async (req,res)=>{
  const rows = await q('SELECT * FROM members WHERE id=?',[req.params.id]);
  if (!rows.length) return res.status(404).json({ message:'Member not found' });
  res.json(rows[0]);
});

router.post('/', auth(), requireRole('admin','committee'), async (req,res)=>{
  const schema = Joi.object({ name: Joi.string().required(), phone: Joi.string().required(), shares: Joi.number().integer().min(0).default(0), savings: Joi.number().min(0).default(0) });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const r = await q('INSERT INTO members(name, phone, shares, savings) VALUES (?,?,?,?)',[value.name,value.phone,value.shares,value.savings]);
  const row = await q('SELECT * FROM members WHERE id=?',[r.insertId]);
  res.status(201).json(row[0]);
});

router.put('/:id', auth(), requireRole('admin','committee'), async (req,res)=>{
  const schema = Joi.object({ name: Joi.string(), phone: Joi.string(), shares: Joi.number().integer().min(0), savings: Joi.number().min(0) });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const fields=[]; const params=[]; for (const [k,v] of Object.entries(value)) { fields.push(`${k}=?`); params.push(v); }
  if (!fields.length) return res.status(400).json({ message:'No fields' });
  params.push(req.params.id);
  await q(`UPDATE members SET ${fields.join(', ')} WHERE id=?`, params);
  const row = await q('SELECT * FROM members WHERE id=?',[req.params.id]);
  res.json(row[0]);
});

router.delete('/:id', auth(), requireRole('admin'), async (req,res)=>{
  await q('DELETE FROM members WHERE id=?',[req.params.id]);
  res.json({ success:true });
});

router.get('/:id/statement', auth(), async (req,res)=>{
  const memberId = req.params.id;
  const member = (await q('SELECT * FROM members WHERE id=?',[memberId]))[0];
  if (!member) return res.status(404).json({ message:'Member not found' });
  const contributions = await q('SELECT * FROM contributions WHERE member_id=? ORDER BY date DESC',[memberId]);
  const loans = await q('SELECT * FROM loans WHERE member_id=? ORDER BY created_at DESC',[memberId]);
  res.json({ member, contributions, loans });
});

export default router;

// ------------------------- src/routes/contributions.js -------------------------
import express from 'express';
import Joi from 'joi';
import { q } from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';
import { paged } from '../utils/pagination.js';
const router = express.Router();

router.get('/', auth(), async (req,res)=>{
  const { page, pageSize, offset } = paged(req);
  const rows = await q(`SELECT SQL_CALC_FOUND_ROWS c.*, m.name as member_name FROM contributions c JOIN members m ON m.id=c.member_id ORDER BY c.date DESC, c.id DESC LIMIT ? OFFSET ?`, [pageSize, offset]);
  const total = (await q('SELECT FOUND_ROWS() as t'))[0].t;
  res.json({ items: rows, page, pageSize, total });
});

router.post('/', auth(), requireRole('admin','committee'), async (req,res)=>{
  const schema = Joi.object({ memberId: Joi.number().required(), date: Joi.date().required(), amount: Joi.number().positive().required() });
  const { value, error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  await q('INSERT INTO contributions(member_id, date, amount) VALUES (?,?,?)',[value.memberId,value.date,value.amount]);
  await q('UPDATE members SET savings = savings + ? WHERE id=?',[value.amount, value.memberId]);
  res.status(201).json({ success:true });
});

router.delete('/:id', auth(), requireRole('admin'), async (req,res)=>{
  const row = (await q('SELECT member_id, amount FROM contributions WHERE id=?',[req.params.id]))[0];
  if (row) await q('UPDATE members SET savings = savings - ? WHERE id=?',[row.amount, row.member_id]);
  await q('DELETE FROM contributions WHERE id=?',[req.params.id]);
  res.json({ success:true });
});