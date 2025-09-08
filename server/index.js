import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from "jsonwebtoken";

const { Pool } = pkg;
const app = express();

// ------------------ Config ------------------
const port = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// CORS (local + Render)
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://clemmens.onrender.com",
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());

// ------------------ BD (Render / Postgres) ------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ej: postgresql://user:pass@host:5432/db?sslmode=require
  ssl: { rejectUnauthorized: false },         // Render requiere SSL
  connectionTimeoutMillis: 10_000,
});

// ------------------ Endpoints utilitarios ------------------
app.get("/health", (_req, res) => res.send("OK"));

app.get("/debug/db", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json(r.rows[0]); // { ok: 1 }
  } catch (e) {
    console.error("DB DEBUG ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

// === SOLO UNA VEZ: crear tabla y sembrar usuarios demo ===
app.post("/dev/setup", async (_req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL
      );
    `);

    await pool.query(`
      INSERT INTO public.users (email, password_hash, name) VALUES
      ('samu@dd.com', '123', 'Samu'),
      ('santi@dd.com', '123', 'Santi'),
      ('javi@dd.com',  '123', 'Javi')
      ON CONFLICT (email) DO NOTHING;
    `);

    res.json({ ok: true, message: "Tabla creada/actualizada y usuarios demo insertados (si no existían)." });
  } catch (e) {
    console.error("SETUP ERROR:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ------------------ Auth ------------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

    // case-insensitive
    const q = await pool.query(
      `SELECT id, email, name, password_hash
         FROM public.users
        WHERE lower(email) = lower($1)
        LIMIT 1`,
      [email]
    );

    if (q.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = q.rows[0];

    // Demo: compara texto plano (en prod usa bcrypt.compare)
    if (password !== user.password_hash) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, user: { email: user.email, name: user.name } });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Error interno", detail: err.message });
  }
});



app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // ¿Ya existe?
    const exists = await pool.query(
      "SELECT 1 FROM public.users WHERE lower(email) = lower($1)",
      [email]
    );
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    // Inserta (por ahora contraseña en texto plano para que coincida con el login actual)
    const r = await pool.query(
      "INSERT INTO public.users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, password, name]
    );

    res.status(201).json({ ok: true, user: r.rows[0] });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    res.status(500).json({ error: "Error interno", detail: e.message });
  }
});
// ------------------ Arranque ------------------
app.listen(port, () => {
  console.log(`API escuchando en puerto ${port}`);
});
