document.addEventListener("DOMContentLoaded", function() {
    // Mostrar producto seleccionado desde el carrito
    const productoInfo = document.getElementById("producto-info");
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length > 0) {
        // Muestra solo el primer producto (puedes adaptar para varios)
        const producto = carrito[0];
        productoInfo.innerHTML = `
            <div class="producto-resumen">
                <img src="${producto.imagen || 'images/perfume_232x210.png'}" alt="${producto.nombre}" style="width:100px; height:auto;">
                <p><strong>${producto.nombre}</strong></p>
                <p>Cantidad: ${producto.cantidad || 1}</p>
                <p>Precio: $${producto.precio || '---'}</p>
            </div>
        `;
    } else {
        productoInfo.innerHTML = "<p>No hay productos seleccionados.</p>";
    }

    // darle formato a la tarjeta
    const numeroTarjeta = document.getElementById("numero");
    const nombreTarjeta = document.getElementById("nombre");
    const fechaExpiracion = document.getElementById("fecha-expiracion");
    const cvv = document.getElementById("codigo-seguridad");

    numeroTarjeta.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 0) {
            value = value.match(/.{1,4}/g).join(' ')
        }
        e.target.value = value
    })
    numeroTarjeta.addEventListener("blur", function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length !== 16 && value.length !== 0) {
            alert("El número de la tarjeta debe tener 16 dígitos.");
        }
    });

    fechaExpiracion.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 2) {
            value = value.substring(0,2) + '/' + value.substring(2,4);
        }
        e.target.value = value
        if (value.length === 5) {
            let mes = parseInt(value.substring(0,2));
            let anio = parseInt("20" + value.substring(3,5));
            const hoy = new Date();
            const mesactual= hoy.getMonth() + 1;
            const anioactual = hoy.getFullYear();
            if (mes < 1 || mes > 12) {
                alert("El mes debe estar entre 01 y 12.");
                e.target.value = "";
                return;
            }
            if (anio < anioactual || (anio === anioactual && mes < mesactual)) {
                alert("La tarjeta ha expirado.");
                e.target.value = "";
                return;
            }
        }
    })
    fechaExpiracion.addEventListener("blur", function(e) {
        let value = e.target.value;
        if (value.length !== 5 && value.length !== 0) {
            alert("La fecha de expiración debe tener el formato MM/AA.");
        }
    });

    cvv.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, '')
        e.target.value = value
    })
    cvv.addEventListener("blur", function(e) {
        let value = e.target.value;
        if (value.length !== 3 && value.length !== 0) {
            alert("El código de seguridad debe tener 3 dígitos.");
        }
    });

    function guardarOrden(carrito){
        const numeroOrden = Math.floor(100000 + Math.random() * 900000);
        const orden = {
            items: carrito,
            fecha: new Date().toISOString(),
            id: numeroOrden,
        };
        localStorage.setItem("orden", JSON.stringify(orden));
        return numeroOrden;
    }

    let ordenNumero = document.getElementById("pago__orden");
    const botonpagos = document.getElementById("pagos__boton");
    botonpagos.addEventListener("click", function(e) {
        e.preventDefault();
        if (numeroTarjeta.value === "" || nombreTarjeta.value === "" || fechaExpiracion.value === "" || cvv.value === "") {
            alert("Por favor, complete todos los campos del formulario.");
            return;
        }
        const formulario = document.getElementById("pagos__formulario");
        const confirmacion = document.getElementById("pagos__confirmacion");
        botonpagos.disabled = true;
        botonpagos.textContent = "Procesando...";
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const orden = guardarOrden(carrito);
        setTimeout(() => {
            formulario.style.display = "none";
            confirmacion.style.display = "block";
            ordenNumero.textContent = "Número de orden: " + orden;
        }, 3000);
    })
});
