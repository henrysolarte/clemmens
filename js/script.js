(function($) {

  "use strict";

  var initPreloader = function() {
    $(document).ready(function($) {
    var Body = $('body');
        Body.addClass('preloader-site');
    });
    $(window).load(function() {
        $('.preloader-wrapper').fadeOut();
        $('body').removeClass('preloader-site');
    });
  }

  // init Chocolat light box
	var initChocolat = function() {
		Chocolat(document.querySelectorAll('.image-link'), {
		  imageSize: 'contain',
		  loop: true,
		})
	}

  var initSwiper = function() {

    var swiper = new Swiper(".main-swiper", {
      speed: 500,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

    var category_swiper = new Swiper(".category-carousel", {
      slidesPerView: 8,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".category-carousel-next",
        prevEl: ".category-carousel-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
        991: {
          slidesPerView: 5,
        },
        1500: {
          slidesPerView: 8,
        },
      }
    });

    $(".products-carousel").each(function(){
      var $el_id = $(this).attr('id');

      var products_swiper = new Swiper("#"+$el_id+" .swiper", {
        slidesPerView: 5,
        spaceBetween: 30,
        speed: 500,
        navigation: {
          nextEl: "#"+$el_id+" .products-carousel-next",
          prevEl: "#"+$el_id+" .products-carousel-prev",
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 3,
          },
          991: {
            slidesPerView: 4,
          },
          1500: {
            slidesPerView: 5,
          },
        }
      });

    });


    // product single page
    var thumb_slider = new Swiper(".product-thumbnail-slider", {
      slidesPerView: 5,
      spaceBetween: 20,
      // autoplay: true,
      direction: "vertical",
      breakpoints: {
        0: {
          direction: "horizontal"
        },
        992: {
          direction: "vertical"
        },
      },
    });

    var large_slider = new Swiper(".product-large-slider", {
      slidesPerView: 1,
      // autoplay: true,
      spaceBetween: 0,
      effect: 'fade',
      thumbs: {
        swiper: thumb_slider,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
  }

  // input spinner
  var initProductQty = function(){

    $('.product-qty').each(function(){
      
      var $el_product = $(this);
      var quantity = 0;
      
      $el_product.find('.quantity-right-plus').click(function(e){
        e.preventDefault();
        quantity = parseInt($el_product.find('#quantity').val());
        $el_product.find('#quantity').val(quantity + 1);
      });

      $el_product.find('.quantity-left-minus').click(function(e){
        e.preventDefault();
        quantity = parseInt($el_product.find('#quantity').val());
        if(quantity>0){
          $el_product.find('#quantity').val(quantity - 1);
        }
      });

    });

  }

  // init jarallax parallax
  var initJarallax = function() {
    jarallax(document.querySelectorAll(".jarallax"));

    jarallax(document.querySelectorAll(".jarallax-keep-img"), {
      keepImg: true,
    });
  }

  // document ready
  $(document).ready(function() {
    
    initPreloader();
    initSwiper();
    initProductQty();
    initJarallax();
    initChocolat();
    // Mostrar botón Add to Cart solo en hover sobre la imagen
    $('.product-figure').on('mouseenter', function() {
      $(this).find('.button-area').fadeIn(150);
    });
    $('.product-figure').on('mouseleave', function() {
      $(this).find('.button-area').fadeOut(150);
    });

  }); // End of a document

  // Mostrar modal con detalles del producto (formato visual)
  window.showProductModal = function(productName) {
    var producto = window.productos.find(function(p) {
      return p.nombre.toLowerCase() === productName.toLowerCase();
    });
    if (!producto) {
      alert('Producto no encontrado: ' + productName);
      return;
    }
    var modalHtml = `
      <div id="productModal" class="modal" style="display:block;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:9999;">
        <div style="background:#fff;margin:5% auto;padding:32px 24px;max-width:370px;position:relative;border-radius:20px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.15);">
          <span style="position:absolute;top:18px;right:24px;cursor:pointer;font-size:28px;font-weight:bold;" onclick="document.getElementById('productModal').remove()">&times;</span>
          <img src="${producto.imagen}" alt="${producto.nombre}" style="width:180px;height:180px;object-fit:cover;border-radius:16px;margin-bottom:18px;">
          <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:10px;">${producto.nombre}</h2>
          <p style="font-size:1.1rem;margin-bottom:6px;"><b>Precio:</b> $${producto.precio.toLocaleString()}</p>
          <p style="font-size:1rem;margin-bottom:6px;"><b>Categoría:</b> ${producto.categoria}</p>
          <p style="font-size:1rem;color:#2d3a4a;margin-bottom:18px;">${producto.descripcion}</p>
        </div>
      </div>
    `;
    // Elimina cualquier modal anterior
    var oldModal = document.getElementById('productModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

})(jQuery);