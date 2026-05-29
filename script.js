/* =========================================
    LÓGICA DEL MODAL DE IMÁGENES
   ========================================= */
const modal = document.getElementById("miModal");
const imgGrande = document.getElementById("imgGrande");
const botonCerrar = document.querySelector(".cerrar");

document.querySelectorAll('.producto-img').forEach(imagen => {
    imagen.onclick = function() {
        if (modal && imgGrande) { 
            modal.style.display = "block";
            imgGrande.src = this.src; 
        }
    }
});

if (botonCerrar) { botonCerrar.onclick = function() { modal.style.display = "none"; } }
window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; }

/* =============================================
    FUNCIÓN PARA LA BARRA DE BÚSQUEDA 
   ============================================= */
document.addEventListener("DOMContentLoaded", () => {
    const inputBusqueda = document.querySelector('.busqueda-contenedor-header input[name="search"]');
    const formulario = document.querySelector('.busqueda-contenedor-header form');
    const contenedorProductos = document.getElementById('productos');

    // CASO A: El usuario está en productos.html
    if (contenedorProductos) {
        const productos = contenedorProductos.getElementsByClassName('producto');
        const parametros = new URLSearchParams(window.location.search);
        const busquedaPrevia = parametros.get('search');

        if (busquedaPrevia) {
            inputBusqueda.value = busquedaPrevia; 
            filtrarProductos(busquedaPrevia, productos); 
        }

        inputBusqueda.addEventListener('input', (e) => {
            const textoFiltro = e.target.value.toLowerCase().trim();
            filtrarProductos(textoFiltro, productos);
        });

        formulario.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    } 
    // CASO B: El usuario está en cualquier otra página
    else {
        if (formulario && inputBusqueda) {
            formulario.addEventListener('submit', (e) => {
                e.preventDefault(); 
                const textoFiltro = inputBusqueda.value.trim();
                
                if (textoFiltro) {
                    window.location.href = `productos.html?search=${encodeURIComponent(textoFiltro)}`;
                }
            });
        }
    }
});

/**
 * Función encargada de ocultar o mostrar las tarjetas de útiles escolares
 */
function filtrarProductos(texto, listaProductos) {
    const textoNormalizado = texto.toLowerCase();
    Array.from(listaProductos).forEach(producto => {
        const contenidoTarjeta = producto.textContent.toLowerCase();
        if (contenidoTarjeta.includes(textoNormalizado)) {
            producto.style.display = ""; 
        } else {
            producto.style.display = "none"; 
        }
    });
}

/* =======================================================================
    LÓGICA GENERAL DE LIBROMANÍA (CARRITO, CHECKOUT Y VALIDACIÓN GLOBAL)
   ======================================================================= */

// 1. CARGA INICIAL: Recupera el carrito guardado en el navegador
let carrito = JSON.parse(localStorage.getItem('carrito_compras')) || [];

// --- FUNCIÓN A: Controlar la apertura y cierre del panel blanco ---
function inicializarEventosCarrito() {
    const abrirCarrito = document.getElementById('abrir-carrito');
    const carritoPanel = document.querySelector('.carrito-overlay');
    const cerrarCarrito = document.querySelector('.cerrar-carrito');

    if (abrirCarrito && carritoPanel) {
        abrirCarrito.onclick = function(e) {
            e.preventDefault();
            carritoPanel.classList.add('active');
        };
    }

    if (cerrarCarrito && carritoPanel) {
        cerrarCarrito.onclick = function() {
            carritoPanel.classList.remove('active');
        };
    }
}

// --- FUNCIÓN B: Escuchar los botones de la tienda para agregar productos ---
function inicializarBotonesAgregar() {
    const botonesAgregar = document.querySelectorAll('.producto button');
    botonesAgregar.forEach((boton) => {
        boton.addEventListener('click', () => {
            const tarjeta = boton.parentElement;
            const nombre = tarjeta.querySelector('h3').textContent;
            const precioTexto = tarjeta.querySelector('.precio').textContent;
            const precio = parseFloat(precioTexto.replace('Q', '').trim());

            const textoOriginal = boton.textContent;
            boton.textContent = "¡Añadido! ✅";
            boton.classList.add('boton-exito');
            boton.disabled = true;

            agregarAlCarrito(nombre, precio);

            setTimeout(() => {
                boton.textContent = textoOriginal;
                boton.classList.remove('boton-exito');
                boton.disabled = false;
            }, 1000);
        });
    });
}

function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    localStorage.setItem('carrito_compras', JSON.stringify(carrito));
    actualizarHTMLCarrito();
}

// --- FUNCIÓN C: Renderizar los productos en la lista y actualizar totales ---
function actualizarHTMLCarrito() {
    const listaCarrito = document.getElementById('items-carrito');
    const contadorCarrito = document.getElementById('contador-carrito');
    const totalPrecio = document.getElementById('total-precio');

    // Actualiza la burbuja del header siempre
    if (contadorCarrito) {
        contadorCarrito.textContent = carrito.length;
    }

    // Si la página actual no tiene el div de la lista, detenemos el renderizado interno
    if (!listaCarrito) return; 
    
    listaCarrito.innerHTML = '';
    let total = 0;

    carrito.forEach((item, index) => {
        total += item.precio;
        listaCarrito.innerHTML += `
            <div class="item-en-carrito">
                <div class="info-item">
                    <p><strong>${item.nombre}</strong></p>
                    <span>Q${item.precio.toFixed(2)}</span>
                </div>
                <button class="btn-eliminar" data-index="${index}">🗑️</button>
            </div>
        `;
    });

    if (totalPrecio) totalPrecio.textContent = total.toFixed(2);

    // Activamos los escuchadores dinámicos
    asignarEventosEliminar();
    inicializarEventosCheckout(total); // Le mandamos el total calculado al Checkout
}

function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    localStorage.setItem('carrito_compras', JSON.stringify(carrito));
    actualizarHTMLCarrito();
}

function asignarEventosEliminar() {
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const indice = parseInt(boton.getAttribute('data-index'));
            eliminarDelCarrito(indice);
        });
    });
}

// --- FUNCIÓN D: Control, Validación y Pasarela del Checkout ---
function inicializarEventosCheckout(totalActual) {
    const btnFinalizarCompra = document.querySelector('.btn-comprar'); 
    const carritoPanel = document.querySelector('.carrito-overlay');
    const checkoutPanel = document.getElementById('checkout-panel');
    const cerrarCheckout = document.querySelector('.cerrar-checkout');
    const totalCheckout = document.getElementById('total-checkout');
    const formularioPago = document.getElementById('formulario-pago');
    const botonFinal = document.querySelector('.btn-confirmar');

    // Evento para dar clic al botón verde de "Finalizar Compra"
    if (btnFinalizarCompra) {
        btnFinalizarCompra.onclick = function() {
            if (carrito.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }
            if (totalCheckout) totalCheckout.textContent = totalActual.toFixed(2);
            if (carritoPanel) carritoPanel.classList.remove('active'); 
            if (checkoutPanel) checkoutPanel.classList.add('active'); 
            validarFormulario(formularioPago, botonFinal); 
        };
    }

    // Evento para cerrar la pasarela de pago
    if (cerrarCheckout && checkoutPanel) {
        cerrarCheckout.onclick = function() { 
            checkoutPanel.classList.remove('active');
            limpiarFormularioCompleto(formularioPago, botonFinal);
        };
    }

    // Monitorear cambios en los métodos de pago (Tarjeta, PayPal, etc.)
    const opcionesPago = document.querySelectorAll('input[name="pago"]');
    const detallesPago = {
        tarjeta: document.getElementById('campos-tarjeta'),
        paypal: document.getElementById('campos-paypal'),
        transferencia: document.getElementById('campos-transferencia')
    };

    opcionesPago.forEach(opcion => {
        opcion.onchange = function() {
            if (!formularioPago) return;
            const campos = formularioPago.querySelectorAll('input:not([type="radio"])');
            campos.forEach(input => input.value = ""); 

            Object.values(detallesPago).forEach(div => { if (div) div.style.display = 'none'; });
            if (detallesPago[opcion.value]) detallesPago[opcion.value].style.display = 'block';

            if (detallesPago.tarjeta) {
                const inputsTarjeta = detallesPago.tarjeta.querySelectorAll('input');
                inputsTarjeta.forEach(input => input.required = (opcion.value === 'tarjeta'));
            }
            
            validarFormulario(formularioPago, botonFinal);
        };
    });

    // Escuchadores dinámicos para las entradas del formulario
    if (formularioPago) {
        formularioPago.oninput = () => validarFormulario(formularioPago, botonFinal);
        
        formularioPago.onsubmit = function(e) {
            e.preventDefault();
            alert("¡Gracias por tu compra en Libromanía! Tu pedido está en proceso.");
            carrito = [];
            localStorage.setItem('carrito_compras', JSON.stringify(carrito));
            actualizarHTMLCarrito();
            limpiarFormularioCompleto(formularioPago, botonFinal);
            if (checkoutPanel) checkoutPanel.classList.remove('active');
        };
    }
}

// --- FUNCIÓN E: Validar campos obligatorios ---
function validarFormulario(formularioPago, botonFinal) {
    if (!formularioPago || !botonFinal) return;
    const inputsRequeridos = formularioPago.querySelectorAll('[required]');
    let todoLleno = true;

    inputsRequeridos.forEach(input => {
        if (input.value.trim() === "") {
            todoLleno = false;
        }
    });

    if (todoLleno) {
        botonFinal.classList.add('boton-listo');
        botonFinal.disabled = false;
    } else {
        botonFinal.classList.remove('boton-listo');
        botonFinal.disabled = true;
    }
}

// --- FUNCIÓN F: Limpiar pasarela ---
function limpiarFormularioCompleto(formularioPago, botonFinal) {
    if (!formularioPago) return;
    formularioPago.reset(); 
    
    const todosLosInputs = formularioPago.querySelectorAll('input');
    todosLosInputs.forEach(input => input.value = "");

    const detallesPago = {
        tarjeta: document.getElementById('campos-tarjeta'),
        paypal: document.getElementById('campos-paypal'),
        transferencia: document.getElementById('campos-transferencia')
    };

    Object.values(detallesPago).forEach(div => { if (div) div.style.display = 'none'; });
    if (detallesPago.tarjeta) detallesPago.tarjeta.style.display = 'block';
    
    validarFormulario(formularioPago, botonFinal); 
}

// =======================================================================
// DISPARADOR GLOBAL AL NAVEGAR EN LA PLATAFORMA
// =======================================================================
document.addEventListener('DOMContentLoaded', () => {
    actualizarHTMLCarrito();       // Levanta datos, calcula totales e inicia checkout
    inicializarEventosCarrito();   // Maneja la apertura del panel blanco lateral
    inicializarBotonesAgregar();   // Monitorea botones de compra de productos
});

/* =========================================
    LÓGICA DEL CARRUSEL DE IMÁGENES
   ========================================= */
let indiceCarrusel = 0;
const totalImagenes = 4;

function moverCarrusel(direccion) {
    const slide = document.getElementById('track-carrusel');
    if (!slide) return; 
    
    indiceCarrusel += direccion;

    if (indiceCarrusel >= totalImagenes) {
        indiceCarrusel = 0;
    } else if (indiceCarrusel < 0) {
        indiceCarrusel = totalImagenes - 1;
    }

    let desplazamiento = -(indiceCarrusel * 25); 
    slide.style.transform = `translateX(${desplazamiento}%)`;
}

setInterval(() => {
    moverCarrusel(1); 
}, 8000);

// =======================================================================
// INTERACTIVIDAD MODULAR: AMPLIAR GRÁFICAS DE REPORTES (LIGHTBOX)
// =======================================================================

function abrirModalReporte(idImagen) {
    // 1. Captura la miniatura exacta usando el ID dinámico que viene del HTML
    var miniatura = document.getElementById(idImagen);
    
    // 2. Captura el contenedor oscuro flotante (Lightbox)
    var modal = document.getElementById('lightbox-reportes');
    
    // 3. Captura la etiqueta de imagen interna que se expandirá a pantalla completa
    var imagenFullscreen = document.getElementById('img-fullscreen-display');

    // Validación de seguridad: Asegura que el árbol DOM tenga listos los componentes
    if (miniatura && modal && imagenFullscreen) {
        // Asigna la ruta exacta de la imagen origen (así se acopla a .jpg o .png dinámicamente)
        imagenFullscreen.src = miniatura.src; 
        
        // Agrega la clase CSS que cambia el display de 'none' a 'flex' con animación
        modal.classList.add('mostrar');       
    } else {
        console.error("Error de Referencia: Verifica que el Lightbox esté presente al final del HTML.");
    }
}

function cerrarModalReporte() {
    var modal = document.getElementById('lightbox-reportes');
    if (modal) {
        modal.classList.remove('mostrar'); // Oculta el componente de forma limpia
    }
}

// =======================================================================
// ESCUCHADOR DE TECLADO (ACCESIBILIDAD PREMIUM)
// =======================================================================
// Permite cerrar cualquier reporte ampliado simplemente presionando la tecla 'Escape'
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
        cerrarModalReporte();
    }
});