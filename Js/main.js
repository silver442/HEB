//alert("Bienvenido");
//$(document).ready(function(){});
    
$(function(){

    //var name1 = prompt("User Name: ");

    var name1;
    $("#userName").focus().keypress(function(e) {
        if(e.which == 13) {
            login(e);
        }
    });
    $("#btnEntrar").click(login);

    function login(e){
        
        name1 = $("#userName").val();
        $("#name").text(name1); 
        $(".login").attr("hidden", true);

        // Cambiamos a keydown para poder capturar ESC
        $("#BusquedaPLU").focus().keydown(evento);
        e.preventDefault();   
    }

    var dbProductos = {
      "123": { "nombre": "PLATANO TABASCO REG", "precio": 29.50 },
      "4011": { "nombre": "PLATANO AMARILLO", "precio": 22.90 },
      "4046": { "nombre": "AGUACATE HASS", "precio": 89.90 },
      "4081": { "nombre": "BERENJENA", "precio": 45.00 },
      "4636": { "nombre": "MANZANA GALA", "precio": 42.50 },
      "4131": { "nombre": "MANZANA FUJI", "precio": 55.00 },
      "4061": { "nombre": "LECHUGA ROMANA", "precio": 19.90 },
      "4044": { "nombre": "DURAZNO AMARILLO", "precio": 65.00 },
      "3142": { "nombre": "TORONJA ROJA", "precio": 25.00 },
      "7501001141444": { "nombre": "GATORE MORA 500 ML", "precio": 16.00 },
      "7501001140027": { "nombre": "GATORE MORAS 350 ML", "precio": 11.00 },
      "7501032398555": { "nombre": "BOLSA PLANA MUNDO VERDE", "precio": 9.90 },
      "7501011115343": { "nombre": "COCA COLA REGULAR 600ML", "precio": 18.00 },
      "7501000100060": { "nombre": "SABRITAS ORIGINAL 42G", "precio": 19.00 }
    };

    var carrito = [];
    var transaccionId = "";
    var estadoTerminal = "ESCANEO";
    var montoDonacion = 0;

    // Iniciar transacción inmediatamente al cargar
    inicializarTransaccion();

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
            }else if(e.which==112){ // tecla p
                verificacionPrecio();
            }
        } 
        else if (estadoTerminal === "DONACION") {
            if(e.which == 13) {     // Enter (Si Redondea)
                carrito.push({ nombre: "Donación Fundación HEB", precio: montoDonacion });
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
            }
            e.preventDefault();
        }
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

