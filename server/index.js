import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from "jsonwebtoken";

const { Pool } = pkg;
const app = express();
const port = 3002;
const JWT_SECRET = "tu_secreto_super_seguro";

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Clemmens",
  password: "2973293428",
  port: 5432,
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan datos" });
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });
  const user = result.rows[0];
  if (password !== user.password_hash) return res.status(401).json({ error: "Contraseña incorrecta" });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user: { email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

// REGISTRO (opcional)
app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Faltan datos" });
  try {
  await pool.query("INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)", [email, password, name]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
