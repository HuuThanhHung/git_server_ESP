
var socket = io("http://localhost:1805")
//var socket = io("http://3.18.143.29:1805")

$(document).ready(function(){
    
    $("#tb_Usrname").html("");
    $("#tb_Psw").html("");
    $("#l_LoginFailed").hide();
    $("#l_SignupFail").hide();
    $("#l_SignupFailed").hide();
    $("#l_SignupFailedd").hide();
    $("#loginForm").show();
    $("#signupForm").hide();
    $("#JsonDisplay").hide();
    $("#chatForm").hide();
    
    //sign up
    $("#btn_SignUp").click(function(){
        $("#loginForm").hide();
        $("#signupForm").show(250);
        

        $("#tb_SignUpFirstNa").html("");
        $("#tb_SignUpLastNa").html("");
        $("#tb_SignUpUsrNa").html("");
        $("#tb_SigUpPassWord").html("");
        
        //click sign up
        $("#btn_SignUp2").click(function(){
            var t_FirstNa = $("#tb_SignUpFirstNa").val();
            var t_LastNa = $("#tb_SignUpLastNa").val();
            var t_UsrNa = $("#tb_SignUpUsrNa").val();
            var t_PassWord = $("#tb_SigUpPassWord").val();
            if(t_PassWord != "" && t_UsrNa != "")
            {
                var SignUpdata = {
                    UrsName: t_UsrNa, 
                    Password: t_PassWord,
                    FirtName: t_FirstNa, 
                    LastName: t_LastNa
                    
                };
                socket.emit("user_signup",SignUpdata);
            }
            else if(t_PassWord == "")
            {
                $("#l_SignupFailed").show();
            }
            else if(t_UsrNa == "")
            {
                if($("#l_SignupFail").is(':visible'))
                {
                    $("#l_SignupFail").hide();
                }
                $("#l_SignupFailedd").show(100);
            }
            socket.on("signup_response_success",function(dataHello){
                alert(dataHello);
                $("#signupForm").hide();              
                $("#boxLastName").html("");     
                $("#boxLastName").append("<div>"+ dataHello +"</div>");
                $("#JsonDisplay").show(200);
            });
            socket.on("signup_response_failed",function(){
                if($("#l_SignupFailedd").is(':visible'))
                {
                    $("#l_SignupFailedd").hide();
                }
                $("#l_SignupFail").show(100);
            });
        });
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
        socket.on("login_response_success",function(datahello){
            $("#loginForm").hide(100); 
            $("#boxLastName").html("");
            $("#boxLastName").append("<div>Hi! "+ datahello +"</div>");
            $("#JsonDisplay").show(200);        
            $("#JsonDisplay").show(200);           
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
        })
    });
    
    

    
    
});

