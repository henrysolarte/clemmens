/* auth.js – autenticación mejorada en el navegador */

const SESSION_KEY = "app.jwt";
const API_URL = window.__API_URL__ || "http://localhost:3002/api";

/* =========================
 * UTILIDADES
 * ========================= */
function setSession(user) {
  // Guarda token y datos (solo si usas JWT en frontend)
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { localStorage.removeItem(SESSION_KEY); return null; }
}
function clearSession() { localStorage.removeItem(SESSION_KEY); }
function showError(el, msg) { if (el) { el.textContent = msg || ""; el.style.display = msg ? "block" : "none"; el.classList.remove("d-none"); } }
function hideError(el) { if (el) { el.textContent = ""; el.style.display = "none"; el.classList.add("d-none"); } }
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function borrarCarritoLocal() { localStorage.removeItem("carrito"); }

/* =========================
 * API
 * ========================= */
async function apiLogin(email, password, signal) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",          // ← activa si usas cookies de sesión
    signal,
  });
  let data = null;
  try { data = await res.json(); } catch { /* respuesta no-JSON */ }

  if (!res.ok || data?.ok === false) {
    // Si el backend manda errores por campo, los pasamos hacia arriba
    const err = new Error(
      data?.error || data?.message || (res.status === 401 ? "Credenciales inválidas." : "No se pudo iniciar sesión.")
    );
    err.fieldErrors = data?.errors || null;
    throw err;
  }
  return data || {};
}

/* =========================
 * FORM LOGIN
 * ========================= */
function attachLoginHandler() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  // Evita tooltips nativos
  form.setAttribute("novalidate", "");

  const emailInput = form.querySelector("#email");
  const passInput  = form.querySelector("#password");
  const errorBox   = form.querySelector("#loginError");
  const submitBtn  = form.querySelector('button[type="submit"]');

  // Mensaje de “cuenta creada”
  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") === "1") {
    const success = document.createElement("div");
    success.className = "alert alert-success";
    success.textContent = "Cuenta creada. Ya puedes iniciar sesión.";
    form.insertAdjacentElement("beforebegin", success);
  }

  // Redirección: prioridad ?next=, luego data-redirect, luego index.html
  const defaultRedirect = form.dataset.redirect || "index.html";
  const nextParam = params.get("next");
  const redirectTo = nextParam ? decodeURIComponent(nextParam) : defaultRedirect;

  let inFlight = null; // AbortController

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Cancelar petición previa si el usuario hace doble click
    if (inFlight) inFlight.abort();
    inFlight = new AbortController();

    // Reset de UI
    hideError(errorBox);
    [emailInput, passInput].forEach((el) => {
      el?.classList.remove("is-invalid");
      el?.removeAttribute("aria-invalid");
    });

    const email = (emailInput?.value || "").trim();
    const password = (passInput?.value || ""); // SIN trim

    // Validaciones mínimas
    let valid = true;
    if (!isValidEmail(email)) { markInvalid(emailInput, "Correo no válido."); valid = false; }
    if (!password) { markInvalid(passInput, "Ingresa tu contraseña."); valid = false; }

    if (!valid) {
      showError(errorBox, "Revisa tus datos.");
      return;
    }

    setLoading(submitBtn, true);

    try {
      const data = await apiLogin(email, password, inFlight.signal);

      // Si usas JWT en el frontend:
      if (data?.token || data?.user) {
        setSession({ token: data.token, user: data.user });
      }

      // Limpieza de estado local
      borrarCarritoLocal();

      // Redirige
      window.location.assign(redirectTo);
    } catch (err) {
      if (err.name === "AbortError") return; // ignorar si se canceló
      // Errores por campo desde backend
      if (err.fieldErrors && typeof err.fieldErrors === "object") {
        if (err.fieldErrors.email) markInvalid(emailInput, err.fieldErrors.email);
        if (err.fieldErrors.password) markInvalid(passInput, err.fieldErrors.password);
      } else {
        // Si 401 y no hay detalle de campos, marcamos password como inválida
        markInvalid(passInput, "Credenciales inválidas.");
      }
      showError(errorBox, err.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(submitBtn, false);
      inFlight = null;
    }
  });

  function markInvalid(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add("is-invalid");
    inputEl.setAttribute("aria-invalid", "true");
    const fb = inputEl.nextElementSibling;
    if (fb && fb.classList.contains("invalid-feedback")) {
      fb.textContent = message;
    }
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.dataset.originalText ??= btn.textContent;
    btn.textContent = loading ? "Accediendo..." : btn.dataset.originalText;
  }
}

/* =========================
 * PROTEGER PÁGINAS
 * ========================= */
function requireAuth(options = {}) {
  const session = getSession();
  if (!session || !session.token) {
    const loginPage = options.loginUrl || "/login.html";
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`${loginPage}?next=${next}`);
    return;
  }
  const userBox = document.querySelector("[data-user-name]");
  if (userBox) userBox.textContent = session.user?.name || session.user?.email || "Usuario";
}

/* =========================
 * LOGOUT
 * ========================= */
function logout(redirectTo = "/login.html") {
  clearSession();
  // Si usas cookies de sesión, puedes llamar a /logout en backend aquí:
  // fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" }).finally(() => {
  //   window.location.assign(redirectTo);
  // });
  window.location.assign(redirectTo);
}

/* =========================
 * EXPONER EN WINDOW & AUTO-INIT
 * ========================= */
window.Auth = { requireAuth, logout, getSession };
document.addEventListener("DOMContentLoaded", attachLoginHandler);
