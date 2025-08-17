1. Instala dependencias:
   npm install

2. Configura tu base de datos PostgreSQL y crea la tabla:

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL
);

3. Cambia los datos de conexión en index.js (usuario, password, database).

4. Ejecuta el servidor:
   npm start

5. El endpoint de login es POST http://localhost:3002/api/login
   { "email": "...", "password": "..." }

6. El endpoint de registro es POST http://localhost:3002/api/register
   { "email": "...", "password": "...", "name": "..." }

7. El backend responde con un token JWT y los datos del usuario.

8. Adapta tu frontend para consumir la API y guardar el token en localStorage.
