// Script para poblar productos en index.html dinámicamente desde la API

function renderizarProductosPorCategoria(categoria, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const productosFiltrados = window.productos.filter(p => p.categoria === categoria);

  if (productosFiltrados.length === 0) {
    contenedor.innerHTML = '<p class="text-center">No hay productos en esta categoría</p>';
    return;
  }

  contenedor.innerHTML = productosFiltrados.map((producto, index) => {
    const productoIndex = window.productos.findIndex(p => p.id === producto.id);
    const nombreEscapado = (producto.nombre || '').replace(/'/g, "\\'");
    
    return `
      <div class="col">
        <div class="product-item">
          <figure>
            <a href="#" title="${producto.nombre}" onclick="event.preventDefault();showProductModal('${nombreEscapado}')">
              <img src="${producto.imagen}" alt="${producto.nombre}" class="tab-image" data-index="${productoIndex}">
            </a>
          </figure>
          <div class="d-flex flex-column text-center">
            <h3 class="fs-6 fw-normal">${producto.nombre}</h3>
            <div class="mb-2">
              <span class="rating">
                ${'<svg width="18" height="18" class="text-warning"><use xlink:href="#star-full"></use></svg>'.repeat(Math.floor(producto.rating || 4))}${((producto.rating || 4) % 1 ? '<svg width="18" height="18" class="text-warning"><use xlink:href="#star-half"></use></svg>' : '')}
              </span>
              <span>(${producto.reviews || 0})</span>
            </div>
            <div class="d-flex justify-content-center align-items-center gap-2 mb-2">
              <span class="text-dark fw-semibold">$${(producto.precio || 0).toLocaleString('es-CO', {maximumFractionDigits: 0})}</span>
            </div>
            <div class="button-area p-3 pt-0">
              <div class="row g-1 mt-2">
                <div class="col-12">
                  <button type="button" class="btn btn-primary rounded-1 p-2 fs-7 btn-add-to-cart" data-index="${productoIndex}" data-nombre="${nombreEscapado}" data-precio="${producto.precio}">
                    <svg width="18" height="18"><use xlink:href='#cart'></use></svg> Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderizarMasVendidos(contenedorId, limite = 12) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  // Ordenar por número de reviews (como proxy de "más vendidos")
  const masVendidos = [...window.productos]
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    .slice(0, limite);

  contenedor.innerHTML = `
    <div class="swiper-wrapper">
      ${masVendidos.map((producto, index) => {
        const productoIndex = window.productos.findIndex(p => p.id === producto.id);
        const nombreEscapado = (producto.nombre || '').replace(/'/g, "\\'");
        
        return `
      <a href="#" class="nav-link swiper-slide text-center" onclick="event.preventDefault();showProductModal('${nombreEscapado}')">
        <img src="${producto.imagen}" class="rounded-circle" alt="${producto.nombre}">
        <h4 class="fs-6 mt-3 fw-normal category-title">${producto.nombre}</h4>
      </a>
    `;
      }).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async function() {
  // Esperar a que los productos estén cargados
  if (!window.productos || window.productos.length === 0) {
    // Esperar al evento productosListos
    await new Promise((resolve) => {
      const handleProductosListos = () => {
        document.removeEventListener('productosListos', handleProductosListos);
        resolve();
      };
      document.addEventListener('productosListos', handleProductosListos);
      
      // Timeout de seguridad de 10 segundos
      setTimeout(resolve, 10000);
    });
  }

  if (!window.productos || window.productos.length === 0) {
    console.warn('No se pudieron cargar los productos');
    return;
  }

  if (typeof window.syncProductosConBackend === 'function') {
    await window.syncProductosConBackend();
  }

  renderizarProductosPorCategoria('Para ella', 'product-grid-ella');
  renderizarProductosPorCategoria('Para él', 'product-grid-el');
  renderizarMasVendidos('mas-vendidos-wrapper', 12); // Cargar los 12 más vendidos

  // Agregar estilos hover a los botones
  const style = document.createElement('style');
  style.textContent = `
    .btn-add-to-cart:hover:not(:disabled) {
      background-color: #0d6efd;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);

  // Delegación de eventos para botones "Agregar al carrito"
  document.body.addEventListener('click', function(e) {
    if (e.target.closest('.btn-add-to-cart')) {
      e.preventDefault();
      const button = e.target.closest('.btn-add-to-cart');
      const productoIndex = button.dataset.index;
      const producto = window.productos[productoIndex];

      if (producto) {
        if (!usuarioLogueado()) {
          alert('Debes iniciar sesión para agregar productos al carrito.');
          window.location.href = 'login.html';
          return;
        }

        agregarAlCarrito({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: 1
        });
      }
    }
  });
});
