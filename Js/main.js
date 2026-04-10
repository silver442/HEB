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

        $("#BusquedaPLU").focus().keypress(evento);
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

        if(e.which == 13){ // tecla enter

            $(".pantalla").addClass("active-transaction");
            producto=$("#BusquedaPLU").val().trim();
            if(producto !== "") {
                busquedaPLU(producto);
            }

        }else if(e.which == 32){ // tecla espaciadora

            total();       

        }else if(e.which==112){ // tecla p

            verificacionPrecio();
       
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

    function total(){
        if(carrito.length > 0) {
            alert("Total cobrado: " + $("#totalPagar").val() + "\nTicket Finalizado.");
            carrito = [];
            transaccionId = Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem("transaccionActual", transaccionId);
            localStorage.setItem("carritoActual", JSON.stringify(carrito));
            $("#numTransaccion").text(transaccionId);
            $(".pantalla").removeClass("active-transaction");
            renderCart();
            $("#BusquedaPLU").focus();
        } else {
            alert("No hay artículos en la cuenta.");
        }
    }

    function verificacionPrecio(){
        $(".content-pantalla").html("<iframe src='Page/Busqueda.html' width='98%' height='98%' id='externo' frameborder='0'></iframe>");
    }
});

