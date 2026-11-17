// Script para poblar productos en index.html dinámicamente desde la API

const API_URL = 'http://localhost:8081/api/products';
let productosGlobal = [];

async function cargarProductosDesdeAPI() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Error al cargar productos: ${response.status}`);
    }
    const productos = await response.json();
    // Guardar en window.productos para mantener compatibilidad
    window.productos = productos;
    productosGlobal = productos;
    return productos;
  } catch (error) {
    console.error('Error cargando productos:', error);
    // Fallback: usar los productos hardcodeados si la API no está disponible
    if (window.productos && window.productos.length > 0) {
      productosGlobal = window.productos;
      return window.productos;
    }
    return [];
  }
}

function renderizarProductosPorCategoria(categoria, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const productosFiltrados = productosGlobal.filter(p => p.category && p.category.name === categoria);

  if (productosFiltrados.length === 0) {
    contenedor.innerHTML = '<p class="text-center">No hay productos en esta categoría</p>';
    return;
  }

  contenedor.innerHTML = productosFiltrados.map((producto, index) => {
    const productoIndex = productosGlobal.findIndex(p => p.id === producto.id);
    return `
        <div class="col">
          <div class="product-item">
            <figure>
              <a href="#" title="${producto.name}">
                <img src="${producto.image || 'images/product-thumb-1.png'}" alt="${producto.name}" class="tab-image" data-index="${productoIndex}">
              </a>
            </figure>
            <div class="d-flex flex-column text-center">
              <h3 class="fs-6 fw-normal">${producto.name}</h3>
              <div class="mb-2">
                <span class="rating">
                  ${'<svg width="18" height="18" class="text-warning"><use xlink:href="#star-full"></use></svg>'.repeat(Math.floor(producto.rating || 4))}${((producto.rating || 4) % 1 ? '<svg width="18" height="18" class="text-warning"><use xlink:href="#star-half"></use></svg>' : '')}
                </span>
                <span>(${producto.reviews || 0})</span>
              </div>
              <div class="d-flex justify-content-center align-items-center gap-2 mb-2">
                <del>$${((producto.price || 0) * 1.2).toLocaleString('es-CO', {maximumFractionDigits: 0})}</del>
                <span class="text-dark fw-semibold">$${(producto.price || 0).toLocaleString('es-CO', {maximumFractionDigits: 0})}</span>
                <span class="badge border border-dark-subtle rounded-0 fw-normal px-1 fs-7 lh-1 text-body-tertiary">15% OFF</span>
              </div>
              <div class="button-area p-3 pt-0">
                <div class="row g-1 mt-2">
                  <div class="col-2"><a href="#" class="btn btn-outline-dark rounded-1 p-2 fs-6" data-index="${productoIndex}"><svg width="18" height="18"><use xlink:href='#heart'></use></svg></a></div>
                  <div class="col-7">
                    <button type="button" class="btn btn-primary rounded-1 p-2 fs-7 btn-cart" data-index="${productoIndex}">
                      <svg width="18" height="18"><use xlink:href='#cart'></use></svg> Add to Cart
                    </button>
                  </div>
                  <div class="col-2"><a href="#" class="btn btn-outline-dark rounded-1 p-2 fs-6" data-index="${productoIndex}"><svg width="18" height="18"><use xlink:href='#heart'></use></svg></a></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', async function() {
  // Cargar productos desde la API
  await cargarProductosDesdeAPI();

  renderizarProductosPorCategoria('Para ella', 'product-grid-ella');
  renderizarProductosPorCategoria('Para él', 'product-grid-el');

  // Delegación de eventos para botones "Add to Cart"
  document.body.addEventListener('click', function(e) {
    if (e.target.closest('.btn-cart')) {
      e.preventDefault();
      const button = e.target.closest('.btn-cart');
      const productoIndex = button.dataset.index;
      const producto = productosGlobal[productoIndex];

      if (producto) {
        if (!usuarioLogueado()) {
          alert('Debes iniciar sesión para agregar productos al carrito.');
          window.location.href = 'login.html';
          return;
        }

        const card = button.closest('.product-item');
        const cantidadInput = card.querySelector('input.quantity');
        const cantidad = cantidadInput ? parseInt(cantidadInput.value, 10) || 1 : 1;

        agregarAlCarrito({
          nombre: producto.name,
          precio: producto.price,
          imagen: producto.image || 'images/product-thumb-1.png',
          cantidad: cantidad
        });
      }
    }
  });
});
