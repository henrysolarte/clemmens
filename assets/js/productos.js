// Script para poblar productos1.html dinámicamente desde window.productos

document.addEventListener('DOMContentLoaded', function() {
  // Verifica que window.productos esté disponible
  if (!window.productos) {
    console.error('No se encontró la lista de productos');
    return;
  }
  // --- STOCK LOCALSTORAGE ---
  // Leer stock guardado
  let stockLS = localStorage.getItem('productos_stock');
  if (stockLS) {
    try {
      stockLS = JSON.parse(stockLS);
      window.productos.forEach((p, i) => {
        if (stockLS[i] !== undefined) p.stock = stockLS[i];
      });
    } catch {}
  }

  // Selecciona los contenedores
  const contenedorElla = document.getElementById('productos-ella');
  const contenedorEl = document.getElementById('productos-el');

  // Función para crear la tarjeta de producto
  function crearTarjeta(producto) {
    return `<div class="col mb-4">
      <div class="card h-100 shadow-sm">
        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
        <div class="card-body">
          <h5 class="card-title">${producto.nombre}</h5>
          <p class="card-text">${producto.descripcion}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge bg-success">${producto.descuento}</span>
            <span class="text-muted text-decoration-line-through">$${producto.precioOriginal.toLocaleString()}</span>
            <span class="fw-bold text-primary">$${producto.precio.toLocaleString()}</span>
          </div>
          <div class="mt-2">
            <span class="badge bg-secondary">Stock: ${producto.stock}</span>
          </div>
        </div>
      </div>
    </div>`;
  }

  // Filtra y muestra productos "Para ella"
  contenedorElla.innerHTML = window.productos
    .filter(p => p.categoria === 'Para ella')
    .map((producto, idx) => {
      return crearTarjeta(producto, idx);
    })
    .join('');

  // Filtra y muestra productos "Para él"
  contenedorEl.innerHTML = window.productos
    .filter(p => p.categoria === 'Para él')
    .map((producto, idx) => {
      return crearTarjeta(producto, idx);
    })
    .join('');

  // Delegación de eventos para botones "Agregar al carrito"
  document.querySelectorAll('.btn-cart').forEach((btn, idx) => {
    // No agregar eventos, productos.html no es para vender
  });
});
