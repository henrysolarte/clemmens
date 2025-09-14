// Script para poblar productos en index.html dinámicamente desde window.productos

document.addEventListener('DOMContentLoaded', function() {
  if (!window.productos) return;

  // Para ella
  const contenedorElla = document.querySelector('#para-ella ~ .row .product-grid');
  if (contenedorElla) {
    contenedorElla.innerHTML = window.productos
      .filter(p => p.categoria === 'Para ella')
      .map(producto => `
        <div class="col">
          <div class="product-item">
            <figure>
              <a href="#" title="${producto.nombre}">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="tab-image">
              </a>
            </figure>
            <div class="d-flex flex-column text-center">
              <h3 class="fs-6 fw-normal">${producto.nombre}</h3>
              <div class="mb-2">
                <span class="rating">
                  ${'<svg width="18" height="18" class="text-warning"><use xlink:href="#star-full"></use></svg>'.repeat(Math.floor(producto.rating))}
                  ${producto.rating % 1 ? '<svg width="18" height="18" class="text-warning"><use xlink:href="#star-half"></use></svg>' : ''}
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
                    <button type="button" class="btn btn-primary rounded-1 p-2 fs-7 btn-cart">
                      <svg width="18" height="18"><use xlink:href='#cart'></use></svg> Add to Cart
                    </button>
                  </div>
                  <div class="col-2"><a href="#" class="btn btn-outline-dark rounded-1 p-2 fs-6"><svg width="18" height="18"><use xlink:href='#heart'></use></svg></a></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `)
      .join('');
  }

  // Para él
  const contenedorEl = document.querySelector('#para-el ~ .row .product-grid');
  if (contenedorEl) {
    contenedorEl.innerHTML = window.productos
      .filter(p => p.categoria === 'Para él')
      .map(producto => `
        <div class="col">
          <div class="product-item">
            <figure>
              <a href="#" title="${producto.nombre}">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="tab-image">
              </a>
            </figure>
            <div class="d-flex flex-column text-center">
              <h3 class="fs-6 fw-normal">${producto.nombre}</h3>
              <div class="mb-2">
                <span class="rating">
                  ${'<svg width="18" height="18" class="text-warning"><use xlink:href="#star-full"></use></svg>'.repeat(Math.floor(producto.rating))}
                  ${producto.rating % 1 ? '<svg width="18" height="18" class="text-warning"><use xlink:href="#star-half"></use></svg>' : ''}
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
                    <button type="button" class="btn btn-primary rounded-1 p-2 fs-7 btn-cart">
                      <svg width="18" height="18"><use xlink:href='#cart'></use></svg> Add to Cart
                    </button>
                  </div>
                  <div class="col-2"><a href="#" class="btn btn-outline-dark rounded-1 p-2 fs-6"><svg width="18" height="18"><use xlink:href='#heart'></use></svg></a></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `)
      .join('');
  }

  // Los más vendidos (primeros 8 productos del array)
  const masVendidos = window.productos.slice(0, 8);
  const masVendidosLista = document.getElementById('mas-vendidos-lista');
  if (masVendidosLista) {
    masVendidos.forEach(producto => {
      const div = document.createElement('div');
      div.className = 'text-center';
      div.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" style="width:140px; height:140px; object-fit:cover; border-radius:50%;">
        <div class="mt-2">${producto.nombre}</div>
      `;
      masVendidosLista.appendChild(div);
    });
  }

  // Para ella
  const paraElla = window.productos.filter(p => p.categoria === 'Para ella');
  const paraEllaLista = document.getElementById('para-ella-lista');
  if (paraEllaLista) {
    paraElla.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <div class="product-item card h-100 p-3 text-center">
          <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid mb-2" style="height:180px; object-fit:cover;">
          <div>${producto.nombre}</div>
          <div class="mt-2">
            <span class="text-warning">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span class="text-muted">(${producto.reviews})</span>
          </div>
          <div class="mt-2">
            <span class="text-decoration-line-through text-muted">$${producto.precioOriginal.toLocaleString()}</span>
            <span class="fw-bold ms-2">$${producto.precio.toLocaleString()}</span>
            <span class="badge bg-light text-dark ms-2">${producto.descuento}</span>
          </div>
        </div>
      `;
      paraEllaLista.appendChild(col);
    });
  }

  // Para él
  const paraEl = window.productos.filter(p => p.categoria === 'Para él');
  const paraElLista = document.getElementById('para-el-lista');
  if (paraElLista) {
    paraEl.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <div class="product-item card h-100 p-3 text-center">
          <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid mb-2" style="height:180px; object-fit:cover;">
          <div>${producto.nombre}</div>
          <div class="mt-2">
            <span class="text-warning">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span class="text-muted">(${producto.reviews})</span>
          </div>
          <div class="mt-2">
            <span class="text-decoration-line-through text-muted">$${producto.precioOriginal.toLocaleString()}</span>
            <span class="fw-bold ms-2">$${producto.precio.toLocaleString()}</span>
            <span class="badge bg-light text-dark ms-2">${producto.descuento}</span>
          </div>
        </div>
      `;
      paraElLista.appendChild(col);
    });
  }
});
