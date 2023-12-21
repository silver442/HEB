//alert("Bienvenido");
//$(document).ready(function(){});
    
$(function(){

    var name1 = prompt("User Name: ");

    $("#name").text(name1);

    $("#BusquedaPLU").focus().keypress(evento);

    function evento(e){

        if(e.which == 13){ // tecla enter

            busquedaPLU($("#BusquedaPLU").val());

        }else if(e.which == 32){ // tecla espaciadora

            total();       

        }else if(e.which==112){ // tecla p

            verificacionPrecio();
       
        }
        else{

            //alert(e.which);
        }
    }

    // -----------------Funciones de las pantallas -----------------------------------------------
    function busquedaPLU(PLU){

        if(PLU==1){
            //alert("producto 1");

            $(".pantalla").append("<p> Producto 1</p>");

            
        }else{

            $(".pantalla").append("<p>" + PLU + "</p>");

        }

        $("#BusquedaPLU").val("");

    }

    function total(){

        alert("Total");

    }

    function verificacionPrecio(){

        alert("Precio");

    }
});

