/* auth.js – autenticación básica en el navegador (demo) */

/** =========================
 * CONFIGURACIÓN REAL
 * ==========================*/
const SESSION_KEY = "app.jwt";
const API_URL = "http://localhost:3002/api";

/** =========================
 * UTILIDADES
 * ==========================*/
function now() { return Date.now(); }
function hours(h) { return h * 60 * 60 * 1000; }

function setSession(user) {
  // Guarda el token JWT y datos del usuario
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    // Opcional: podrías decodificar el JWT y validar expiración
    return s;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg || "";
  el.style.display = msg ? "block" : "none";
}

/** =========================
 * VALIDACIONES BÁSICAS
 * ==========================*/
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isStrongishPassword(v) {
  // mín 8, al menos 1 letra y 1 número (demo)
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);
}

/** =========================
 * LOGIN (con backend real)
 * ==========================*/
async function apiLogin(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Credenciales inválidas");
  }
  return await res.json();
}

/** =========================
 * INTEGRACIÓN CON EL FORM
 * - Busca un form con id="loginForm"
 * - Campos: #email, #password
 * - Área de error: #loginError (opcional)
 * ==========================*/
function attachLoginHandler() {
  const form = document.querySelector("#loginForm");
  if (!form) return; // si esta página no tiene login, no hacemos nada

  const emailInput = form.querySelector("#email");
  const passInput  = form.querySelector("#password");
  const errorBox   = form.querySelector("#loginError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (emailInput?.value || "").trim();
    const pass  = (passInput?.value  || "").trim();

    // Limpia errores UI
    showError(errorBox, "");
    emailInput?.classList.remove("is-invalid");
    passInput?.classList.remove("is-invalid");

    // Validaciones
    let valid = true;
    if (!isValidEmail(email)) {
      emailInput?.classList.add("is-invalid");
      valid = false;
    }
    // Ya no se valida la contraseña segura, se permite cualquier contraseña
    if (!valid) {
      showError(errorBox, "Verifica el correo.");
      return;
    }

    // Autenticar (API real)
    try {
      const { token, user } = await apiLogin(email, pass);
      setSession({ token, user });
      // Redirige a home o dashboard
      const target = form.dataset.redirect || "/";
      window.location.assign(target);
    } catch (err) {
      showError(errorBox, err.message || "Credenciales inválidas.");
      passInput?.classList.add("is-invalid");
    }
  });
}

/** =========================
 * PROTEGER PÁGINAS
 * Llama requireAuth() al inicio de cualquier página protegida.
 * ==========================*/
function requireAuth(options = {}) {
  const session = getSession();
  if (!session || !session.token) {
    // Redirige a login conservando la ruta actual en ?next=
    const loginPage = options.loginUrl || "/login.html";
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`${loginPage}?next=${next}`);
    return;
  }
  // Puedes mostrar nombre del usuario si existe un contenedor
  const userBox = document.querySelector("[data-user-name]");
  if (userBox) userBox.textContent = session.user?.name || session.user?.email || "Usuario";
}

/** =========================
 * LOGOUT
 * ==========================*/
function logout(redirectTo = "/login.html") {
  clearSession();
  window.location.assign(redirectTo);
}

/** =========================
 * EXPONER EN WINDOW
 * ==========================*/
window.Auth = { requireAuth, logout, getSession };

/** =========================
 * AUTO-INIT loginForm
 * ==========================*/
document.addEventListener("DOMContentLoaded", attachLoginHandler);
