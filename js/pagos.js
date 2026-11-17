document.addEventListener("DOMContentLoaded", function() {
    // Mostrar producto seleccionado desde el carrito
    const productoInfo = document.getElementById("producto-info");
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let productosHTML = '';
    let total = 0;
    if (carrito.length > 0) {
        productosHTML += '<div style="display:flex; flex-direction:column; align-items:center;">';
        carrito.forEach(producto => {
            const itemTotal = (producto.precio || 0) * (producto.cantidad || 1);
            total += itemTotal;
            productosHTML += `
                <div class="producto-resumen" style="margin-bottom:20px; background:rgba(255,255,255,0.08); border-radius:12px; padding:16px; width:90%; max-width:400px; color:white;">
                    <img src="${producto.imagen || 'images/perfume_232x210.png'}" alt="${producto.nombre}" style="width:100px; height:auto; margin-bottom:10px;">
                    <p style="margin:0;"><strong>${producto.nombre}</strong></p>
                    <p style="margin:0;">Cantidad: ${producto.cantidad || 1}</p>
                    <p style="margin:0;">Precio unitario: $${producto.precio ? producto.precio.toLocaleString() : '---'}</p>
                    <p style="margin:0;">Subtotal: $${itemTotal.toLocaleString()}</p>
                </div>
            `;
        });
        productosHTML += `<div style="margin-top:20px; font-size:1.2em; color:#fff; font-weight:bold;">TOTAL A PAGAR: $${total.toLocaleString()}</div>`;
        productosHTML += '</div>';
        window.totalPago = total;
    } else {
        productosHTML = "<p>No hay productos seleccionados.</p>";
        window.totalPago = 0;
    }
    productoInfo.innerHTML = productosHTML;

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

    async function crearOrden(datosOrden) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Debes estar autenticado para realizar el pago.");
            window.location.href = "login.html";
            return null;
        }

        try {
            const response = await fetch("http://localhost:8080/api/orders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(datosOrden)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Error al procesar el pago");
            }

            const orden = await response.json();
            return orden;
        } catch (error) {
            console.error("Error en la petición:", error);
            throw error;
        }
    }

    let ordenNumero = document.getElementById("pago__orden");
    const botonpagos = document.getElementById("pagos__boton");
    botonpagos.addEventListener("click", function(e) {
        e.preventDefault();
        if (numeroTarjeta.value === "" || nombreTarjeta.value === "" || fechaExpiracion.value === "" || cvv.value === "") {
            alert("Por favor, complete todos los campos del formulario.");
            return;
        }

        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        if (carrito.length === 0) {
            alert("El carrito está vacío.");
            return;
        }

        // Calcular subtotal e IVA
        let subtotal = 0;
        const items = carrito.map(prod => {
            const itemTotal = (prod.precio || 0) * (prod.cantidad || 1);
            subtotal += itemTotal;
            return {
                productId: prod.id,
                quantity: prod.cantidad || 1,
                unitPrice: prod.precio
            };
        });

        const iva = subtotal * 0.19;
        const totalAmount = subtotal + iva;

        const datosOrden = {
            items: items,
            subtotal: subtotal,
            iva: iva,
            totalAmount: totalAmount,
            cardNumber: numeroTarjeta.value.replace(/\s/g, ''),
            cardholderName: nombreTarjeta.value,
            expirationDate: fechaExpiracion.value,
            cvv: cvv.value
        };

        const formulario = document.getElementById("pagos__formulario");
        const confirmacion = document.getElementById("pagos__confirmacion");
        botonpagos.disabled = true;
        botonpagos.textContent = "Procesando...";

        crearOrden(datosOrden)
            .then(orden => {
                // Vacía el carrito después de pagar exitosamente
                localStorage.removeItem("carrito");
                formulario.style.display = "none";
                confirmacion.style.display = "block";
                ordenNumero.textContent = "Número de orden: " + orden.orderNumber + "\nTotal pagado: $" + (orden.totalAmount ? orden.totalAmount.toLocaleString() : "0");
            })
            .catch(error => {
                alert("Error al procesar el pago: " + error.message);
                botonpagos.disabled = false;
                botonpagos.textContent = "Realizar Pago";
            });
    })
});
