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
          <button class="btn btn-primary mt-2 btn-cart" ${producto.stock <= 0 ? 'disabled' : ''}>${producto.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}</button>
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
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const producto = window.productos[idx];
      if (producto.stock <= 0) {
        alert('Producto sin stock.');
        btn.disabled = true;
        btn.textContent = 'Sin stock';
        return;
      }
      if (!window.usuarioLogueado || !window.usuarioLogueado()) {
        alert('Debes iniciar sesión para agregar productos al carrito.');
        window.location.href = 'login.html';
        return;
      }
      // Por defecto 1 unidad
      const cantidad = 1;
      if (producto.stock < cantidad) {
        alert('No hay suficiente stock disponible.');
        return;
      }
      // Aquí deberías llamar a agregarAlCarrito si existe
      if (typeof window.agregarAlCarrito === 'function') {
        window.agregarAlCarrito({
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: cantidad
        });
      }
      // Rebajar stock
      producto.stock -= cantidad;
      // Guardar stock actualizado en localStorage
      localStorage.setItem('productos_stock', JSON.stringify(window.productos.map(p => p.stock)));
      // Actualizar botón si stock llega a 0
      if (producto.stock <= 0) {
        btn.disabled = true;
        btn.textContent = 'Sin stock';
      }
      // Actualizar visualización de stock
      btn.parentElement.querySelector('.badge.bg-secondary').textContent = 'Stock: ' + producto.stock;
    });
  });
});
