// productos.js
// Lista de perfumes Clemenss para mostrar en productos.html

const productos = [
  {
    nombre: "La Vie Est Belle",
    precio: 250000,
    imagen: "images/product-thumb-1.png",
    categoria: "Para ella",
    descuento: "10% OFF",
    precioOriginal: 350000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Flowerbomb",
    precio: 230000,
    imagen: "images/product-thumb-2.png",
    categoria: "Para ella",
    descuento: "10% OFF",
    precioOriginal: 330000,
    rating: 4.5,
    reviews: 41
  },
  {
    nombre: "Chanel No 5",
    precio: 450000,
    imagen: "images/product-thumb-3.png",
    categoria: "Para ella",
    descuento: "15% OFF",
    precioOriginal: 600000,
    rating: 4.5,
    reviews: 32
  },
  {
    nombre: "Good Girl",
    precio: 420000,
    imagen: "images/product-thumb-4.png",
    categoria: "Para ella",
    descuento: "15% OFF",
    precioOriginal: 540000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Black Opium",
    precio: 340000,
    imagen: "images/product-thumb-5.png",
    categoria: "Para ella",
    descuento: "15% OFF",
    precioOriginal: 460000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "J'adore",
    precio: 480000,
    imagen: "images/product-thumb-6.png",
    categoria: "Para ella",
    descuento: "15% OFF",
    precioOriginal: 620000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Sì (Giorgio Armani)",
    precio: 380000,
    imagen: "images/product-thumb-7.png",
    categoria: "Para ella",
    descuento: "10% OFF",
    precioOriginal: 480000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Alien (Mugler)",
    precio: 350000,
    imagen: "images/product-thumb-8.png",
    categoria: "Para ella",
    descuento: "15% OFF",
    precioOriginal: 460000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Le Male Elixir",
    precio: 400000,
    imagen: "images/perfume_232x210.png",
    categoria: "Para él",
    descuento: "10% OFF",
    precioOriginal: 500000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "bleu de chanel",
    precio: 450000,
    imagen: "images/product-thumb-11.png",
    categoria: "Para él",
    descuento: "15% OFF",
    precioOriginal: 650000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "One Millon",
    precio: 480000,
    imagen: "images/product-thumb-12.png",
    categoria: "Para él",
    descuento: "20% OFF",
    precioOriginal: 680000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Dior Sauvage",
    precio: 370000,
    imagen: "images/product-thumb-13.png",
    categoria: "Para él",
    descuento: "15% OFF",
    precioOriginal: 480000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Creed Aventus",
    precio: 450000,
    imagen: "images/product-thumb-14.png",
    categoria: "Para él",
    descuento: "15% OFF",
    precioOriginal: 650000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Acqua Di Gio Parfum",
    precio: 400000,
    imagen: "images/product-thumb-15.png",
    categoria: "Para él",
    descuento: "15% OFF",
    precioOriginal: 600000,
    rating: 4.5,
    reviews: 222
  },
  {
    nombre: "Le Labo Santal 33",
    precio: 450000,
    imagen: "images/product-thumb-16.png",
    categoria: "Para él",
    descuento: "19% OFF",
    precioOriginal: 650000,
    rating: 4.5,
    reviews: 222
  }
];

function renderProductos() {
  const contenedor = document.getElementById('productos-lista');
  if (!contenedor) return;
  contenedor.innerHTML = '';
  if (!productos || productos.length === 0) {
    contenedor.innerHTML = '<div class="col"><div class="alert alert-warning text-center">No hay productos para mostrar.</div></div>';
    return;
  }
  productos.forEach((producto, idx) => {
    const card = document.createElement('div');
    card.className = 'col';
    card.innerHTML = `
      <div class="product-item card h-100 p-3">
        <figure class="text-center">
          <img src="${producto.imagen}" alt="${producto.nombre}" class="tab-image" style="max-width:100%;height:auto;">
        </figure>
        <div class="d-flex flex-column text-center">
          <h3 class="fs-6 fw-normal">${producto.nombre}</h3>
          <div class="mb-2">
            <span class="rating">
              ${'<svg width="18" height="18" class="text-warning"><use xlink:href="#star-full"></use></svg>'.repeat(Math.floor(producto.rating))}
              <svg width="18" height="18" class="text-warning"><use xlink:href="#star-half"></use></svg>
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
              <div class="col-3"><input type="number" name="quantity" class="form-control border-dark-subtle input-number quantity" value="1" id="qty-prod-${idx}"></div>
              <div class="col-7">
                <button type="button" class="btn btn-primary rounded-1 p-2 fs-7 btn-cart" id="btn-cart-${idx}" data-idx="${idx}">
                  <svg width="18" height="18"><use xlink:href='#cart'></use></svg> Add to Cart
                </button>
              </div>
              <div class="col-2"><a href="#" class="btn btn-outline-dark rounded-1 p-2 fs-6"><svg width="18" height="18"><use xlink:href='#heart'></use></svg></a></div>
            </div>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(card);
  });

  // Asignar eventos a todos los botones después de renderizar (sin setTimeout)
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!usuarioLogueado()) {
        alert('Debes iniciar sesión para agregar productos al carrito.');
        window.location.href = 'login.html';
        return;
      }
      const idx = this.getAttribute('data-idx');
      const cantidad = parseInt(document.getElementById(`qty-prod-${idx}`).value) || 1;
      const producto = productos[idx];
      console.log('Evento directo: Add to Cart clickeado:', producto.nombre);
      agregarAlCarrito({
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: cantidad
      });
      // Mostrar mensaje en index.html
      const mensaje = document.getElementById('mensaje');
      if (mensaje) {
        mensaje.textContent = 'Producto agregado al carrito.';
        mensaje.style.display = 'block';
        setTimeout(() => { mensaje.style.display = 'none'; }, 2500);
      }
      // Actualizar carrito.html si está abierto
      if (window.location.pathname.includes('carrito.html')) {
        if (typeof mostrarCarrito === 'function') {
          mostrarCarrito();
        }
      }
    });
  });
  console.log('Botones Add to Cart listos y eventos asignados.');
}

function usuarioLogueado() {
  try {
    const session = localStorage.getItem('app.jwt');
    if (!session) return false;
    const obj = JSON.parse(session);
    return !!(obj && obj.token);
  } catch {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', renderProductos);
