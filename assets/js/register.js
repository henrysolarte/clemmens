// register.js - Registro de usuario con API backend
const API_URL = "http://localhost:3002/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const errorBox = document.getElementById("registerError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";
    errorBox.textContent = "";
    nameInput.classList.remove("is-invalid");
    emailInput.classList.remove("is-invalid");
    passInput.classList.remove("is-invalid");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    let valid = true;
    if (!name) {
      nameInput.classList.add("is-invalid");
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.classList.add("is-invalid");
      valid = false;
    }
    // Ya no se valida la contraseña segura, se permite cualquier contraseña
    if (!valid) {
      errorBox.textContent = "Verifica los datos.";
      errorBox.style.display = "block";
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al registrar");
      }
      alert("Usuario creado correctamente. Ahora puedes iniciar sesión.");
      window.location.href = "login.html";
    } catch (err) {
      errorBox.textContent = err.message || "Error al registrar";
      errorBox.style.display = "block";
    }
  });
});
