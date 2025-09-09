// index.js (CommonJS)

require('dotenv').config(); // lee .env en local (Render inyecta sus propias env vars)

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Puerto dinámico (Render asigna PORT)
const PORT = process.env.PORT || 3002;

// Ruta de prueba
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Arranque del servidor
app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT}`);
});
