//alert("Bienvenido");
//$(document).ready(function(){});
    
$(function(){

    //var name1 = prompt("User Name: ");

    var name1;
    var guardadoNombre = localStorage.getItem("nombreCajero");

    if (guardadoNombre) {
        iniciarSesionUsuario(guardadoNombre);
    } else {
        $("#userName").focus();
    }

    $("#userName").keydown(function(e) {
        if(e.which == 13) {
            login(e);
        }
    });
    $("#btnEntrar").click(login);

    function login(e){
        name1 = $("#userName").val().trim();
        if(name1 !== "") {
            localStorage.setItem("nombreCajero", name1);
            iniciarSesionUsuario(name1);
        }
        e.preventDefault();   
    }

    function iniciarSesionUsuario(nombre) {
        $("#name").text(nombre); 
        $(".login").attr("hidden", true);

        // Cambiamos a keydown para poder capturar ESC y F3
        $("#BusquedaPLU").off("keydown").on("keydown", evento);
        
        // Iniciar transacción inmediatamente al logearse o cargar
        inicializarTransaccion();
        
        if (!localStorage.getItem("guiaVisto")) {
            estadoTerminal = "INSTRUCCIONES";
            $("#modalInstrucciones").show();
        }
        
        $("#BusquedaPLU").focus();
    }

    var dbProductos = {
        // --- FRUTAS (4 dígitos) ---
        "4011": { "nombre": "PLATANO AMARILLO", "precio": 22.90 },
        "4046": { "nombre": "AGUACATE HASS", "precio": 89.90 },
        "4081": { "nombre": "BERENJENA", "precio": 45.00 },
        "4636": { "nombre": "MANZANA GALA", "precio": 42.50 },
        "4131": { "nombre": "MANZANA FUJI", "precio": 55.00 },
        "4061": { "nombre": "LECHUGA ROMANA", "precio": 19.90 },
        "4044": { "nombre": "DURAZNO AMARILLO", "precio": 65.00 },
        "3142": { "nombre": "TORONJA ROJA", "precio": 25.00 },
        "4545": { "nombre": "PLATANO TABASCO REG", "precio": 29.50 },
        
        // --- ABARROTES (3 dígitos) ---
        "101": { "nombre": "COCA COLA REGULAR 600ML", "precio": 18.00 },
        "102": { "nombre": "SABRITAS ORIGINAL 42G", "precio": 19.00 },
        "103": { "nombre": "GATORE MORAS 350 ML", "precio": 11.00 },
        "104": { "nombre": "GATORE MORA 500 ML", "precio": 16.00 },
        "105": { "nombre": "GALLETAS OREO 114G", "precio": 20.50 },
        "106": { "nombre": "LECHE ENTERA LALA 1L", "precio": 28.00 },
        "107": { "nombre": "PAN BLANCO BIMBO", "precio": 45.00 },
        
        // --- OTROS: Farmacia, Carnes, Hogar (5 dígitos) ---
        "50001": { "nombre": "ASPIRINA 500MG 40 TAB", "precio": 45.50 },
        "50002": { "nombre": "PARACETAMOL 500MG", "precio": 25.00 },
        "50101": { "nombre": "ARRACHERA MARINADA KG", "precio": 289.00 },
        "50102": { "nombre": "POLLO ENTERO KG", "precio": 65.50 },
        "50201": { "nombre": "DETERGENTE ARIEL 1KG", "precio": 42.00 },
        "50202": { "nombre": "SUAVITEL 850ML", "precio": 22.90 },
        "50203": { "nombre": "BOLSA PLANA MUNDO VERDE", "precio": 9.90 }
    };

    var carrito = [];
    var transaccionId = "";
    var estadoTerminal = "ESCANEO";
    var montoDonacion = 0;

    function inicializarTransaccion() {
        let storedCart = localStorage.getItem("carritoActual");
        let storedTrans = localStorage.getItem("transaccionActual");
        
        if (storedCart && storedTrans) {
            carrito = JSON.parse(storedCart);
            transaccionId = storedTrans;
        } else {
            carrito = [];
            transaccionId = Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem("transaccionActual", transaccionId);
            localStorage.setItem("carritoActual", JSON.stringify(carrito));
        }
        $("#numTransaccion").text(transaccionId);
        
        if(carrito.length > 0) {
            $(".pantalla").addClass("active-transaction");
        }
        renderCart();
    }

    var producto;

    function evento(e){
        if (e.which == 114) { // tecla F3
            e.preventDefault();
            hacerLogoff();
            return;
        }

        if(estadoTerminal === "ESCANEO") {
            if(e.which == 13){ // tecla enter
                $(".pantalla").addClass("active-transaction");
                producto=$("#BusquedaPLU").val().trim();
                if(producto !== "") {
                    busquedaPLU(producto);
                }
            }else if(e.which == 32){ // tecla espaciadora
                e.preventDefault();
                iniciarCobro();       
            }else if(e.which == 112){ // tecla F1 (Help)
                estadoTerminal = "INSTRUCCIONES";
                $("#modalInstrucciones").show();
                e.preventDefault();
            }
        } 
        else if (estadoTerminal === "INSTRUCCIONES") {
            if(e.which == 13 || e.which == 32 || e.which == 27) { // Enter, Espacio o Esc
                $("#modalInstrucciones").hide();
                localStorage.setItem("guiaVisto", "true");
                estadoTerminal = "ESCANEO";
            }
            e.preventDefault();
        } 
        else if (estadoTerminal === "DONACION") {
            if(e.which == 13) {     // Enter (Si Redondea)
                carrito.push({ nombre: "Donación Fundación HEB", precio: montoDonacion }); // Donación Fundación HEB
                estadoTerminal = "TOTAL";
                $("#modalDonacion").hide();
                generarPantallaTotal();
            } else if(e.which == 27 || e.which == 8) { // Esc / Backspace (No Redondea)
                estadoTerminal = "TOTAL";
                $("#modalDonacion").hide();
                generarPantallaTotal();
            }
            e.preventDefault();
        }
        else if (estadoTerminal === "TOTAL") {
            if (e.which == 32 || e.which == 13) { // Espacio o Enter finaliza
                finalizarTransaccion();
            } else if (e.which == 27 || e.which == 8 || e.which == 46 || e.which == 88 || e.which == 120) { 
                // ESC (27), Backspace (8), Delete (46), X (88), x (120) -> Regresar y quitar donación
                regresarAEscaneo();
            }
            e.preventDefault();
        }
    }

    function hacerLogoff() {
        // Borramos variables de la memoria local
        localStorage.removeItem("nombreCajero");
        localStorage.removeItem("transaccionActual");
        localStorage.removeItem("carritoActual");
        localStorage.removeItem("guiaVisto"); // Resetear la guía
        
        // Esconder vistas que pudiesen haber asomado
        $("#modalDonacion").hide();
        $("#pantallaTotal").hide();
        $("#modalInstrucciones").hide();
        $("#pantallaEscaneo").show();
        
        // Limpiamos los rastros y devolvemos variables a defaults
        carrito = [];
        $(".pantalla").empty();
        $("#totalPagar").val("$ 0.00");
        $("#cajaFundacion").val("");
        $("#numTransaccion").text("");
        
        // Reiniciamos al entorno de logueo primario
        estadoTerminal = "ESCANEO";
        $(".login").attr("hidden", false);
        $("#userName").val("").focus();
        $("#name").text("");
        $("#BusquedaPLU").off("keydown");
    }

    function regresarAEscaneo() {
        // Quitar la donación si existía
        carrito = carrito.filter(item => item.nombre !== "Donación Fundación HEB");
        localStorage.setItem("carritoActual", JSON.stringify(carrito));
        
        // Transicionar vista
        $("#pantallaTotal").hide();
        $("#pantallaEscaneo").show();
        
        estadoTerminal = "ESCANEO";
        renderCart();
        $("#BusquedaPLU").val("").focus();
    }

    //  Reloj
    setInterval(function(){
        var reloj = moment().format("hh:mm:ss a");
        $('#hora').html(reloj);
    }, 1000);

    $('#fecha').html(
        moment().date() + "-" + moment().format("MMMM") + "-" + moment().format("YYYY") 
    );

    // -----------------Funciones de Promociones -----------------------------------------------
    function calcularDescuentos() {
        let descuentos = [];
        let conteos = {};
        carrito.forEach(item => {
            conteos[item.nombre] = (conteos[item.nombre] || 0) + 1;
        });

        // Didáctico: 2x1 Sabritas
        if(conteos["SABRITAS ORIGINAL 42G"] && conteos["SABRITAS ORIGINAL 42G"] >= 2) {
            let vecesAplica = Math.floor(conteos["SABRITAS ORIGINAL 42G"] / 2);
            descuentos.push({ nombre: "Descuento x Combo", precio: -(19.00 * vecesAplica) });
        }
        // Didáctico: Gatorade descuento fijo ($2 pesos menos si lleva 2 o más)
        if(conteos["GATORE MORAS 350 ML"] && conteos["GATORE MORAS 350 ML"] >= 2) {
            descuentos.push({ nombre: "Descuento X AHORRAMAS=", precio: -2.00 });
        }

        return descuentos;
    }

    // -----------------Funciones de las pantallas -----------------------------------------------
    function renderCart() {
        $(".pantalla").empty();
        
        let sumTotal = 0;

        carrito.forEach((item, index) => {
            sumTotal += item.precio;
            
            let row = `<div class="item-row">
                <span class="item-index">${index + 1}</span>
                <span class="item-name">${item.nombre}</span>
                <span class="item-price">${item.precio.toFixed(2)}</span>
            </div>`;
            $(".pantalla").append(row);
        });

        // Agregamos Descuentos para reflejarlos vivos en la pantalla
        let desc = calcularDescuentos();
        desc.forEach((d) => {
            sumTotal += d.precio; // d.precio ya es negativo
            let row = `<div class="item-descuento-escaneo">
                <span class="item-index">****</span>
                <span class="item-name">${d.nombre}</span>
                <span class="item-price">${Math.abs(d.precio).toFixed(2)}-</span>
            </div>`;
            $(".pantalla").append(row);
        });

        // Auto-scroll al final
        let objDiv = $(".pantalla")[0];
        objDiv.scrollTop = objDiv.scrollHeight;

        $("#totalPagar").val("$ " + sumTotal.toFixed(2));
    }

    function busquedaPLU(PLU){
        if(dbProductos[PLU]) {
            let item = dbProductos[PLU];
            carrito.push({ nombre: item.nombre, precio: item.precio });
            localStorage.setItem("carritoActual", JSON.stringify(carrito));
            renderCart();
        } else {
            console.log("Artículo no encontrado: " + PLU);
            let rowWrapper = `<div style="color:red; text-align:center; padding: 5px;">Plu Inválido: ${PLU}</div>`;
            $(".pantalla").append(rowWrapper);
            
            let objDiv = $(".pantalla")[0];
            objDiv.scrollTop = objDiv.scrollHeight;
        }

        $("#BusquedaPLU").val("");
    }

    function iniciarCobro() {
        if(carrito.length === 0) {
            alert("No hay artículos en la cuenta.");
            return;
        }

        let prevSumTotal = 0;
        let sumDescuentos = 0;
        carrito.forEach(i => prevSumTotal+=i.precio);
        let desc = calcularDescuentos();
        desc.forEach(d => sumDescuentos += d.precio);
        let totalPagar = prevSumTotal + sumDescuentos; 

        // Calculo de de redondeo
        let faltante = Math.ceil(totalPagar) - totalPagar;
        faltante = parseFloat(faltante.toFixed(2));

        // Dibujamos la pantalla de totales de inmediato
        generarPantallaTotal();

        // Lanzamos modal sobre #pantallaTotal si aplica
        if(faltante > 0 && faltante < 1) {
            montoDonacion = faltante;
            $("#textoRedondeo").text(`Faltan $ ${faltante.toFixed(2)} centavos`);
            estadoTerminal = "DONACION";
            $("#modalDonacion").show();
        } else {
            estadoTerminal = "TOTAL";
        }
    }

    function generarPantallaTotal() {
        $("#pantallaEscaneo").hide();
        $("#pantallaTotal").show();

        let descuentos = calcularDescuentos();
        let sumTotal = 0;
        let donacionObj = null;

        carrito.forEach((item) => { 
            if(item.nombre === "Donación Fundación HEB") {
                donacionObj = item;
            }
            sumTotal += item.precio; 
        });
        
        let sumDescuentos = 0;
        $("#listaDescuentos").empty();
        
        let indexFilas = 1;
        descuentos.forEach((desc) => {
            sumDescuentos += desc.precio;
            let valAbs= Math.abs(desc.precio).toFixed(2);
            let row = `<div class="item-descuento">
                <span>${indexFilas} &nbsp;&nbsp;&nbsp; ${desc.nombre}</span>
                <span>${valAbs} $</span>
                <span>${valAbs} $</span>
            </div>`;
            $("#listaDescuentos").append(row);
            indexFilas++;
        });

        // Insertar Donación si existe en el carrito
        if (donacionObj) {
            let valStr = donacionObj.precio.toFixed(2);
            let row = `<div class="item-descuento" style="color: black;">
                <span>${indexFilas} &nbsp;&nbsp;&nbsp; ${donacionObj.nombre}</span>
                <span>${valStr} $</span>
                <span></span>
            </div>`;
            $("#listaDescuentos").append(row);
            
            $("#cajaFundacion").val("Fundación HEB");
            $("#cajaFundacion").css("border", "1px solid #aaa");
        } else {
            $("#cajaFundacion").val("");
            $("#cajaFundacion").css("border", "none");
        }
        
        let aplicado = Math.abs(sumDescuentos);
        let debe = sumTotal - aplicado;

        $("#pagoSubtotal").val("$ " + sumTotal.toFixed(2)); 
        $("#pagoAplicado").val("$ -" + aplicado.toFixed(2));
        $("#pagoDebe").val("$ " + debe.toFixed(2));
    }

    function finalizarTransaccion(){
        carrito = [];
        transaccionId = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem("transaccionActual", transaccionId);
        localStorage.setItem("carritoActual", JSON.stringify(carrito));
        $("#numTransaccion").text(transaccionId);
        $(".pantalla").removeClass("active-transaction");
        
        // Regresar a pantalla de escaneo
        $("#pantallaTotal").hide();
        $("#pantallaEscaneo").show();
        $("#cajaFundacion").val("").css("border", "1px solid #aaa");
        
        estadoTerminal = "ESCANEO";
        renderCart();
        $("#BusquedaPLU").val("").focus();
    }

    function verificacionPrecio(){
        $(".content-pantalla").html("<iframe src='Page/Busqueda.html' width='98%' height='98%' id='externo' frameborder='0'></iframe>");
    }
});

