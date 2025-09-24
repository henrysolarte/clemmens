// carrito.js
// Funciones para gestionar el carrito en localStorage

const carritoIsProd = location.hostname.endsWith("onrender.com");
const CARRITO_API_URL = carritoIsProd
    ? "https://perfumeriaclemenss.onrender.com/api"
    : (window.__API_URL__ || "http://localhost:3002/api");

const stockCache = {
    byId: new Map(),
    byName: new Map(),
};

function normalizarNombreProducto(nombre) {
    return String(nombre || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "")
        .trim();
}

function nombreCanonicoProducto(nombre) {
    const normalizado = normalizarNombreProducto(nombre);
    const alias = {
        onemillon: "onemillion",
    };
    return alias[normalizado] || normalizado;
}

async function cargarStockDesdeBackend() {
    try {
        const res = await fetch(`${CARRITO_API_URL}/perfumes`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const productos = Array.isArray(data?.productos) ? data.productos : [];

        stockCache.byId.clear();
        stockCache.byName.clear();

        productos.forEach((p) => {
            const id = Number(p.id);
            const stock = Math.max(0, Number(p.stock) || 0);
            if (Number.isInteger(id)) {
                stockCache.byId.set(id, stock);
            }
            stockCache.byName.set(nombreCanonicoProducto(p.nombre), stock);
        });
    } catch (err) {
        console.warn("No se pudo cargar stock desde backend:", err?.message || err);
    }
}

function obtenerStockProducto(item) {
    const itemId = Number(item?.productoId);
    if (Number.isInteger(itemId) && stockCache.byId.has(itemId)) {
        return stockCache.byId.get(itemId);
    }
    return stockCache.byName.get(nombreCanonicoProducto(item?.nombre)) ?? 0;
}

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
        Object.assign(mensaje.style, {
            display: 'none',
            position: 'fixed',
            top: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#324f5c',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: '8px',
            zIndex: '9999',
            fontSize: '1.2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        });
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
    if (typeof mostrarCarrito === 'function' && window.location.pathname.includes('carrito.html')) {
        mostrarCarrito();
    }
    mostrarMensaje('El carrito ha sido actualizado.');
  }
});

async function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const contenedor = document.getElementById("carrito-lista");
    const subtotalEl = document.getElementById("subtotal");
    const ivaEl = document.getElementById("iva");
    const totalEl = document.getElementById("total");

    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = '<div class="text-center p-4">El carrito está vacío.</div>';
        if(subtotalEl) subtotalEl.textContent = "$0";
        if(ivaEl) ivaEl.textContent = "$0";
        if(totalEl) totalEl.textContent = "$0";
        return;
    }

    await cargarStockDesdeBackend();

    let subtotal = 0;
    contenedor.innerHTML = carrito.map((producto, index) => {
        const itemTotal = producto.precio * producto.cantidad;
        subtotal += itemTotal;
        const stock = obtenerStockProducto(producto);
        const btnPlusDisabled = (stock > 0 && producto.cantidad >= stock) ? 'disabled' : '';
        return `
        <div class="carrito__item">
            <img src="${producto.imagen}" alt="${producto.nombre}" class="carrito__item-imagen">
            <div class="carrito__item-info">
                <span class="carrito__item-nombre">${producto.nombre}</span>
                <span class="carrito__item-precio">$${producto.precio.toLocaleString()}</span>
                <span class="carrito__item-total">Total: $${itemTotal.toLocaleString()}</span>
            </div>
            <div class="carrito__item-cantidad">
                <button onclick="cambiarCantidad(${index}, ${producto.cantidad - 1})">-</button>
                <span>${producto.cantidad}</span>
                <button onclick="cambiarCantidad(${index}, ${producto.cantidad + 1})" ${btnPlusDisabled}>+</button>
            </div>
            <button class="carrito__item-eliminar" onclick="eliminarProducto(${index})">Eliminar</button>
        </div>
        `;
    }).join("");

    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    if(subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
    if(ivaEl) ivaEl.textContent = `$${iva.toLocaleString()}`;
    if(totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
}

async function cambiarCantidad(index, cantidad) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    await cargarStockDesdeBackend();
    const stock = obtenerStockProducto(carrito[index]);
    if (cantidad < 1) {
        eliminarProducto(index);
    } else if (stock > 0 && cantidad > stock) {
        mostrarMensaje('No hay suficiente stock disponible.');
        carrito[index].cantidad = stock;
        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarCarrito();
    } else {
        carrito[index].cantidad = cantidad;
        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarCarrito();
    }
}

function eliminarProducto(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (confirm("¿Estás seguro de que deseas eliminar este producto del carrito?")) {
        carrito.splice(index, 1);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarCarrito();
        mostrarMensaje("Producto eliminado del carrito.");
    }
}

// Ejecutar mostrarCarrito al cargar la página del carrito
if (window.location.pathname.includes('carrito.html')) {
    document.addEventListener('DOMContentLoaded', mostrarCarrito);
}
