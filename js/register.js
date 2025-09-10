// register.js - Registro de usuario con API backend (mejorado)
const isProd = location.hostname.endsWith("onrender.com");
const API_URL = isProd
  ? "https://perfumeriaclemenss.onrender.com/api"
  : (window.__API_URL__ || "http://localhost:3002/api");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const errorBox = document.getElementById("registerMsg");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Mejora accesibilidad del contenedor de errores
  errorBox.setAttribute("role", "alert");
  errorBox.setAttribute("aria-live", "polite");

  let inFlightController = null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Limpieza de estado visual
    resetErrors();

    // OJO: no hacemos trim() a password para no alterar la intención del usuario
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value; // sin trim

    // Validaciones mínimas en cliente
    const fieldErrors = {};
    if (!name) fieldErrors.name = "Ingresa tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Correo no válido.";
    if (!password) fieldErrors.password = "Ingresa una contraseña.";

    if (Object.keys(fieldErrors).length > 0) {
      showFieldErrors(fieldErrors);
      showError("Verifica los datos.");
      return;
    }

    // Evitar doble envío / abortar solicitud anterior
    if (inFlightController) inFlightController.abort();
    inFlightController = new AbortController();

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        signal: inFlightController.signal,
      });

      let data = null;
      try {
        // Puede fallar si el backend responde vacío o con HTML
        data = await res.json();
      } catch {
        // data se queda en null; lo manejamos abajo
      }

      // Normalizamos éxito: ok=true o status 201/200
      const success = res.ok && (data?.ok !== false);
      if (!success) {
        // Intentamos extraer errores por campo si vienen del backend
        if (data?.errors && typeof data.errors === "object") {
          showFieldErrors(data.errors);
        }

        // Mensaje general
        const serverMessage =
          data?.error ||
          data?.message ||
          (res.status === 409 ? "El correo ya está registrado." :
          res.status === 400 ? "Datos inválidos." :
          "Error al registrar.");

        throw new Error(serverMessage);
      }

      // Éxito
      // Mejor evitar alert(); usamos un mensaje verde temporal o redirigimos directo
      showError("¡Cuenta creada! Redirigiendo a inicio de sesión...", true);
      setTimeout(() => { window.location.href = "login.html?registered=1"; }, 1500);
    } catch (err) {
      if (err.name === "AbortError") return; // se canceló por nuevo submit
      showError(err.message || "Error al registrar.");
    } finally {
      setLoading(false);
      inFlightController = null;
    }
  });

  function resetErrors() {
    errorBox.style.display = "none";
    errorBox.textContent = "";

    [nameInput, emailInput, passInput].forEach((el) => {
      el.classList.remove("is-invalid");
      el.removeAttribute("aria-invalid");
      const fb = el.nextElementSibling;
      if (fb && fb.classList.contains("invalid-feedback")) fb.textContent = "";
    });
  }

  function showError(msg, isSuccess = false) {
    errorBox.textContent = msg;
    errorBox.className = isSuccess ? 'alert alert-success' : 'alert alert-danger';
    errorBox.setAttribute('role', 'alert');
    errorBox.style.display = "block";
  }

  function showFieldErrors(errorsObj) {
    if (errorsObj.name) setInvalid(nameInput, errorsObj.name);
    if (errorsObj.email) setInvalid(emailInput, errorsObj.email);
    if (errorsObj.password) setInvalid(passInput, errorsObj.password);
  }

  function setInvalid(inputEl, message) {
    inputEl.classList.add("is-invalid");
    inputEl.setAttribute("aria-invalid", "true");
    // Asumimos Bootstrap: <div class="invalid-feedback"></div> justo después del input
    let fb = inputEl.nextElementSibling;
    if (!fb || !fb.classList.contains("invalid-feedback")) {
      // Creamos si no existe
      fb = document.createElement("div");
      fb.className = "invalid-feedback";
      inputEl.insertAdjacentElement("afterend", fb);
    }
    fb.textContent = message;
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.dataset.originalText ??= submitBtn.textContent;
    submitBtn.textContent = loading ? "Creando cuenta..." : submitBtn.dataset.originalText;
  }
});
