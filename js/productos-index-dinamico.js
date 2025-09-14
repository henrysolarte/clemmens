// Script para poblar productos en index.html dinámicamente desde window.productos

function renderizarProductosPorCategoria(categoria, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const productosFiltrados = window.productos.filter(p => p.categoria === categoria);

  contenedor.innerHTML = productosFiltrados.map((producto, index) => {
    // Usamos el índice global del array de `window.productos` para mantener la consistencia
    const productoIndex = window.productos.findIndex(p => p.nombre === producto.nombre);
    return `
        <div class="col">
          <div class="product-item">
            <figure>
              <a href="#" title="${producto.nombre}">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="tab-image" data-index="${productoIndex}">
              </a>
            </figure>
            <div class="d-flex flex-column text-center">
              <h3 class="fs-6 fw-normal">${producto.nombre}</h3>
              <div class="mb-2">
                <span class="rating">
                  ${'<svg width="18" height="18" class="text-warning"><use xlink:href="#star-full"></use></svg>'.repeat(Math.floor(producto.rating))}${(producto.rating % 1 ? '<svg width="18" height="18" class="text-warning"><use xlink:href="#star-half"></use></svg>' : '')}
                </span>
                <span>(${producto.reviews})</span>
              </div>
              <div class="d-flex justify-content-center align-items-center gap-2 mb-2">
                <del>$${producto.precioOriginal.toLocaleString()}</del>
                <span class="text-dark fw-semibold">$${producto.precio.toLocaleString()}</span>
                <span class="badge border border-dark-subtle rounded-0 fw-normal px-1 fs-7 lh-1 text-body-tertiary">${producto.descuento}</span>
              </div>
              <div class="button-area p-3 pt-0">
                <div class="row g-1 mt-2">
                  <div class="col-3"><input type="number" name="quantity" class="form-control border-dark-subtle input-number quantity" value="1"></div>
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

document.addEventListener('DOMContentLoaded', function() {
  if (!window.productos) return;

  renderizarProductosPorCategoria('Para ella', 'product-grid-ella');
  renderizarProductosPorCategoria('Para él', 'product-grid-el');

  // Delegación de eventos para botones "Add to Cart"
  document.body.addEventListener('click', function(e) {
    if (e.target.closest('.btn-cart')) {
      e.preventDefault();
      const button = e.target.closest('.btn-cart');
      const productoIndex = button.dataset.index;
      const producto = window.productos[productoIndex];

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
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: cantidad
        });
      }
    }
  });
});
