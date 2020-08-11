
var socket = io("http://localhost:1805")
//var socket = io("http://3.18.143.29:1805")

$(document).ready(function(){
    $("#tb_Usrname").html("");
    $("#tb_Psw").html("");
    $("#l_LoginFailed").hide();
    $("#loginForm").show(200);
    $("#signupForm").hide();
    $("#JsonDisplay").hide();
    $("#chatForm").hide();
    
    //sign up
    $("#btn_SignUp").click(function(){
        $("#loginForm").hide();
        $("#signupForm").show(200);     
    });
    // login
 
    $("#btn_LogIn").click(function(){           
        if($("#tb_Usrname").val() =="" )
            alert("Please enter your user name");
        else if($("#tb_Psw").val()=="")
            alert("Please enter your password")
        else{
            var t_name = $("#tb_Usrname").val();
            var t_psw = $("#tb_Psw").val();
            var LogIndata = {
                name: t_name, 
                password: t_psw};
            //step 3.1 client request login
            socket.emit("user_login",LogIndata);

        }
        //step 3.2 server check password and send back response    
        socket.on("login_response_failed",function(data_failed){
            //alert(data_failed);
            $("#l_LoginFailed").show();
        })
        socket.on("login_response_success",function(){
            $("#loginForm").hide(100);
            $("#l_LoginFailed").hide();
            $("#JsonDisplay").show(200);
        })
    });
    
    //step 2 Server send bradcast to all node
    socket.on("Sever_send_ESP_Json",function(Json_from_Server){
        $("#boxpH").html("");
        $("#boxEC").html("");
        $("#boxTemp").html("");
        $("#boxpumpStatus").html("");
               
        $("#boxpH").append("<div class = 'user'>"+ Json_from_Server.pH +"</div>");
        $("#boxEC").append("<div class = 'user'>"+ Json_from_Server.EC +"</div>");
        $("#boxTemp").append("<div class = 'user'>"+ Json_from_Server.Temp +"</div>");
        $("#boxpumpStatus").append("<div class = 'user'>"+ Json_from_Server.PumpStatus +"</div>");

        
    });

    
    
});

