/* =========================================
    LÓGICA DEL MODAL DE IMÁGENES
   ========================================= */
const modal = document.getElementById("miModal");
const imgGrande = document.getElementById("imgGrande");
const botonCerrar = document.querySelector(".cerrar");

document.querySelectorAll('.producto-img').forEach(imagen => {
    imagen.onclick = function() {
        modal.style.display = "block";
        imgGrande.src = this.src; 
    }
});

botonCerrar.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; }

/* =============================================
    FUNCIÓN PARA LA BARRA DE BÚSQUEDA 
   ============================================= */
const barraBusqueda = document.querySelector('.busqueda-contenedor input');
const formularioBusqueda = document.querySelector('.busqueda-contenedor form');

if (formularioBusqueda) {
    formularioBusqueda.addEventListener('submit', (e) => {
        e.preventDefault(); 
    });
}

if (barraBusqueda) {
    barraBusqueda.addEventListener('keyup', (e) => {
        const textoUsuario = e.target.value.toLowerCase();
        const productos = document.querySelectorAll('.producto');

        productos.forEach(producto => {
            const nombreProducto = producto.querySelector('h3').textContent.toLowerCase();
            producto.style.display = nombreProducto.includes(textoUsuario) ? "block" : "none";
        });
    });
}

/* =========================================
    LÓGICA DEL CARRITO
   ========================================= */
let carrito = [];
const carritoPanel = document.getElementById('carrito-panel');
const abrirCarrito = document.getElementById('abrir-carrito');
const cerrarCarrito = document.querySelector('.cerrar-carrito');
const listaCarrito = document.getElementById('items-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const totalPrecio = document.getElementById('total-precio');

abrirCarrito.addEventListener('click', (e) => { e.preventDefault(); carritoPanel.classList.add('active'); });
cerrarCarrito.addEventListener('click', () => { carritoPanel.classList.remove('active'); });

document.querySelectorAll('.producto button').forEach((boton) => {
    boton.addEventListener('click', () => {
        const tarjeta = boton.parentElement;
        const nombre = tarjeta.querySelector('h3').textContent;
        const precioTexto = tarjeta.querySelector('.precio').textContent;
        const precio = parseFloat(precioTexto.replace('Q', ''));

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

function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    actualizarHTMLCarrito();
}

function actualizarHTMLCarrito() {
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
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">🗑️</button>
            </div>
        `;
    });

    contadorCarrito.textContent = carrito.length;
    contadorCarrito.classList.add('animar-contador');
    setTimeout(() => contadorCarrito.classList.remove('animar-contador'), 400);
    totalPrecio.textContent = total.toFixed(2);
}

function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    actualizarHTMLCarrito();
}

/* =========================================
    LÓGICA DEL CHECKOUT Y VALIDACIÓN
   ========================================= */
const checkoutPanel = document.getElementById('checkout-panel');
const btnFinalizarCompra = document.querySelector('.btn-comprar'); 
const cerrarCheckout = document.querySelector('.cerrar-checkout');
const totalCheckout = document.getElementById('total-checkout');
const formularioPago = document.getElementById('formulario-pago');
const botonFinal = document.querySelector('.btn-confirmar');

btnFinalizarCompra.addEventListener('click', () => {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    totalCheckout.textContent = totalPrecio.textContent;
    carritoPanel.classList.remove('active'); 
    checkoutPanel.classList.add('active'); 
    validarFormulario(); // Validar al abrir
});

cerrarCheckout.addEventListener('click', () => { checkoutPanel.classList.remove('active');
    limpiarFormularioCompleto();
 });

// Cambio de método de pago
const opcionesPago = document.querySelectorAll('input[name="pago"]');
const detallesPago = {
    tarjeta: document.getElementById('campos-tarjeta'),
    paypal: document.getElementById('campos-paypal'),
    transferencia: document.getElementById('campos-transferencia')
};

opcionesPago.forEach(opcion => {
    opcion.addEventListener('change', () => {
        // Limpiar inputs antes de cambiar
        const campos = formularioPago.querySelectorAll('input:not([type="radio"])');
        campos.forEach(input => input.value = ""); 

        Object.values(detallesPago).forEach(div => div.style.display = 'none');
        detallesPago[opcion.value].style.display = 'block';

        // Re-validar requeridos
        const inputsTarjeta = detallesPago.tarjeta.querySelectorAll('input');
        inputsTarjeta.forEach(input => input.required = (opcion.value === 'tarjeta'));
        
        validarFormulario();
    });
});

// ÚNICA FUNCIÓN DE VALIDACIÓN
function validarFormulario() {
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

formularioPago.addEventListener('input', validarFormulario);

formularioPago.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("¡Gracias por tu compra en Libromanía! Tu pedido está en proceso.");
    carrito = [];
    actualizarHTMLCarrito();
    limpiarFormularioCompleto();
    checkoutPanel.classList.remove('active');
});

// FUNCIÓN PARA REINICIAR TODO EL FORMULARIO
function limpiarFormularioCompleto() {
    formularioPago.reset(); // Borra todos los inputs
    
    // Borra manualmente cualquier valor que quede en los métodos ocultos
    const todosLosInputs = formularioPago.querySelectorAll('input');
    todosLosInputs.forEach(input => input.value = "");

    // Regresa la vista a la tarjeta por defecto
    Object.values(detallesPago).forEach(div => div.style.display = 'none');
    detallesPago.tarjeta.style.display = 'block';
    
    // Desactiva el botón (lo pone gris)
    validarFormulario(); 
}