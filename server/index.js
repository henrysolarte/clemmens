// server/index.js  —  API lista para Render + Postgres

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');  // <- Este funciona en Render (100% JS)


const app = express();
app.use(express.json()); // Permite recibir JSON en el body

/* ===== CORS: permite tu front de Render (y localhost para pruebas) ===== */
/* ===== CORS: clemmens (Render) y localhost; preflight explícito ===== */
const ALLOWED_ORIGINS = new Set([
  'https://clemmens.onrender.com',
]);

function esOrigenLocalPermitido(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin || '');
}

const corsOptions = {
  origin(origin, cb) {
    // Permite peticiones sin Origin (curl/health) y las de la lista
    if (!origin || ALLOWED_ORIGINS.has(origin) || esOrigenLocalPermitido(origin)) return cb(null, true);
    return cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,              // no usamos cookies
  optionsSuccessStatus: 200,       // evita 204 problemáticos en algunos navegadores
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));            // responde preflight en cualquier ruta
app.use((req, res, next) => {                   // fallback: si llegara algún OPTIONS, 200
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});


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

app.get('/api/perfumes', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, nombre, marca, descripcion, precio, imagen_url, stock, categoria
      FROM perfumes
      ORDER BY id ASC
    `);
    res.json({ ok: true, productos: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

function normalizarNombreProducto(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function nombreCanonicoProducto(nombre) {
  const normalizado = normalizarNombreProducto(nombre);
  const alias = {
    onemillon: 'onemillion',
  };
  return alias[normalizado] || normalizado;
}

app.post('/api/checkout', async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length === 0) {
    return res.status(400).json({ ok: false, error: 'No hay items para procesar' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT id, nombre, stock FROM perfumes ORDER BY id ASC FOR UPDATE'
    );

    const byId = new Map(rows.map((p) => [Number(p.id), p]));
    const byName = new Map(rows.map((p) => [nombreCanonicoProducto(p.nombre), p]));
    const requeridoPorId = new Map();
    const faltantes = [];

    for (const item of items) {
      const cantidad = Number(item?.cantidad);
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ ok: false, error: 'Cantidad invalida en el carrito' });
      }

      let producto = null;
      const productoId = Number(item?.productoId);
      if (Number.isInteger(productoId) && byId.has(productoId)) {
        producto = byId.get(productoId);
      } else if (item?.nombre) {
        producto = byName.get(nombreCanonicoProducto(item.nombre)) || null;
      }

      if (!producto) {
        faltantes.push({ nombre: item?.nombre || 'Producto desconocido' });
        continue;
      }

      const actual = requeridoPorId.get(producto.id) || 0;
      requeridoPorId.set(producto.id, actual + cantidad);
    }

    if (faltantes.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        ok: false,
        error: 'Hay productos que no existen en la base de datos',
        faltantes,
      });
    }

    const sinStock = [];
    for (const [id, cantidad] of requeridoPorId.entries()) {
      const producto = byId.get(id);
      if (!producto) continue;
      const stockActual = Number(producto.stock);
      if (cantidad > stockActual) {
        sinStock.push({
          id,
          nombre: producto.nombre,
          solicitado: cantidad,
          disponible: stockActual,
        });
      }
    }

    if (sinStock.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        ok: false,
        error: 'Stock insuficiente',
        sinStock,
      });
    }

    for (const [id, cantidad] of requeridoPorId.entries()) {
      await client.query('UPDATE perfumes SET stock = stock - $1 WHERE id = $2', [cantidad, id]);
    }

    await client.query('COMMIT');
    return res.json({ ok: true, message: 'Compra confirmada y stock actualizado' });
  } catch (e) {
    await client.query('ROLLBACK');
    return res.status(500).json({ ok: false, error: e.message });
  } finally {
    client.release();
  }
});

/* ===== Auth sencilla: register / login ===== */
app.post('/api/register', async (req, res) => {
  try {
    let { name, email, password } = req.body || {};
    // Normaliza y valida los campos
    name = typeof name === 'string' ? name.trim() : '';
    email = typeof email === 'string' ? email.trim() : '';
    password = typeof password === 'string' ? password : '';
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
    let { email, password } = req.body || {};
    email = typeof email === 'string' ? email.trim() : '';
    password = typeof password === 'string' ? password : '';
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }
    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const user = rows[0];
    let ok = false;
    const hash = String(user.password_hash || '');

    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      ok = await bcrypt.compare(password, hash);
    } else {
      // Compatibilidad temporal para usuarios legacy guardados en texto plano.
      ok = password === hash;
      if (ok) {
        const newHash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
      }
    }

    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // (Aquí podrías emitir un JWT; por ahora devolvemos datos básicos)
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ===== Auth: obtener datos del usuario ===== */
app.get('/api/me', async (req, res) => {
  // En producción, aquí deberías validar el JWT o la cookie de sesión
  // Para demo, devolvemos un usuario fijo si se envía email por query
  const email = req.query.email;
  if (!email) return res.status(401).json({ error: 'No autenticado' });
  try {
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user: rows[0] });
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
