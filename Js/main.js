//alert("Bienvenido");
//$(document).ready(function(){});
    
$(function(){

    //var name1 = prompt("User Name: ");

    var name1;
    $("#userName").focus().keypress(evento);
    $("#btnEntrar").click(login);

    function login(e){
        
        name1 = $("#userName").val();
        $("#name").text(name1); 
        $(".login").attr("hidden", true);

        $("#BusquedaPLU").focus().keypress(evento);
        e.preventDefault();   
    }

    var producto;

    function evento(e){

        if(e.which == 13){ // tecla enter

            $(".pantalla").css("borderTop","black 2px dashed");
            producto=$("#BusquedaPLU").val();
            busquedaPLU(producto);

        }else if(e.which == 32){ // tecla espaciadora

            total();       

        }else if(e.which==112){ // tecla p

            verificacionPrecio();
       
        }
        else{

            //alert(e.which);
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

        //alert("Precio");

        $(".content-pantalla").html("<iframe src='Page/Busqueda.html' width='98%' height='98%' id='externo' frameborder='0'></iframe>");
        //$("iframe").attr("src","Page/Busqueda.html");
    }
});

