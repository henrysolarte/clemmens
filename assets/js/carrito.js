// Mostrar el contenido del carrito en la página carrito.html
function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const contenedor = document.getElementById("carrito-lista");
    if (!contenedor) return;
    if (carrito.length === 0) {
        contenedor.innerHTML = '<p class="text-center">El carrito está vacío.</p>';
        return;
    }
    let total = 0;
    contenedor.innerHTML = carrito.map(producto => {
        total += producto.precio * producto.cantidad;
        return `
        <div class="card mb-3">
            <div class="row g-0 align-items-center">
                <div class="col-md-2 text-center">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid" style="max-width:80px;">
                </div>
                <div class="col-md-6">
                    <h5 class="card-title mb-1">${producto.nombre}</h5>
                    <p class="mb-0">Precio: $${producto.precio.toLocaleString()}</p>
                </div>
                <div class="col-md-2">
                    <span class="badge bg-secondary">Cantidad: ${producto.cantidad}</span>
                </div>
                <div class="col-md-2 text-end">
                    <span class="fw-bold">Subtotal: $${(producto.precio * producto.cantidad).toLocaleString()}</span>
                </div>
            </div>
        </div>
        `;
    }).join("");
    contenedor.innerHTML += `<div class='text-end fw-bold fs-5 mt-3'>Total: $${total.toLocaleString()}</div>`;
}

// Ejecutar mostrarCarrito al cargar la página carrito.html
document.addEventListener('DOMContentLoaded', mostrarCarrito);
// carrito.js
// Funciones para gestionar el carrito en localStorage

function agregarAlCarrito(producto) {
    console.log('agregarAlCarrito llamado con:', producto);
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    // Buscar si el producto ya está en el carrito
    const index = carrito.findIndex(p => p.nombre === producto.nombre);
    if (index !== -1) {
        carrito[index].cantidad += producto.cantidad;
    } else {
        carrito.push(producto);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    console.log('Carrito guardado:', localStorage.getItem("carrito"));
    mostrarMensaje("Producto agregado al carrito");
}

function mostrarMensaje(texto) {
    let mensaje = document.getElementById("mensaje");
    if (!mensaje) {
        mensaje = document.createElement("div");
        mensaje.id = "mensaje";
        document.body.appendChild(mensaje);
    }
    mensaje.textContent = texto;
    mensaje.style.display = "block";
    setTimeout(() => {
        mensaje.style.display = "none";
    }, 3000);
}

// Actualiza el carrito automáticamente si se agrega un producto desde otra pestaña o ventana
window.addEventListener('storage', function(e) {
  if (e.key === 'carrito') {
    mostrarCarrito();
    mostrarMensaje('Producto agregado al carrito');
  }
});
