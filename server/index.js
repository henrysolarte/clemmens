// server/index.js  —  API lista para Render + Postgres

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();

/* ===== CORS: permite tu front de Render (y localhost para pruebas) ===== */
app.use(
  cors({
    origin: [
      'https://clemmens.onrender.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json());

/* ===== Postgres (Render inyecta DATABASE_URL) ===== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

/* ===== Asegurar esquema mínimo (users) al arrancar ===== */
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}
ensureSchema().catch((e) => {
  console.error('Error creando esquema:', e.message);
});

/* ===== Rutas básicas ===== */
app.get('/', (_req, res) => res.send('API OK'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.get('/api/db-ping', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ===== Auth sencilla: register / login ===== */
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos' });
    }
    const hash = await bcrypt.hash(password, 10);
    const q = `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;
    const { rows } = await pool.query(q, [name, email, hash]);
    res.status(201).json({ user: rows[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Email ya registrado' });
    }
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }
    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // (Aquí podrías emitir un JWT; por ahora devolvemos datos básicos)
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* 404 controlado para /api */
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

/* ===== Arranque ===== */
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});
