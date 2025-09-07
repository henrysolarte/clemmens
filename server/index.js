import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from "jsonwebtoken";

const { Pool } = pkg;
const app = express();

// Render asigna el puerto en process.env.PORT
const port = process.env.PORT || 3002;
const JWT_SECRET = "tu_secreto_super_seguro";

// Configuración CORS
app.use(cors({ origin: "https://clemmens.onrender.com", credentials: true }));
app.use(express.json());

// Conexión a la base de datos (⚠️ aquí luego usaremos process.env.DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ token, user: { email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

// REGISTRO
app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Faltan datos" });

  try {
    await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)",
      [email, password, name]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

// ✅ endpoint de prueba
app.get("/health", (_req, res) => res.send("OK"));

// Raíz
app.get("/", (_req, res) => res.send("API online 🚀"));

// Escuchar
app.listen(port, () => {
  console.log(`API escuchando en puerto ${port}`);
});
