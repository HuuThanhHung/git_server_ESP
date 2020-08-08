
var socket = io("http://localhost:1805")

$(document).ready(function(){
    ////step 2 Server send bradcast to all node
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

    
    //alert("hello new day");
    $("#loginForm").hide();
    $("#chatForm").hide();
    $("#JsonDisplay").show();
    //step 1: sclient emit request
    $("#btnRegister").click(function(){
        socket.emit("client_send_username", $("#txtUsername").val());
    });

    // Logout request
    $("#btnLogout").click(function(){
        socket.emit("client_send_logout");
        $("#chatForm").hide(100);
        $("#loginForm").show(200);
        
    });

    // send message from client
    $("#btnSendMessage").click(function(){
        socket.emit("user_send_message",$("#txtMessage").val());
    });

    //recieve message from server
    socket.on("server_send_message", function(message_data_from_server){
        $("#listMessage").append("<div class='ms'>"+message_data_from_server.un+": "+message_data_from_server.content+"</div>");

    });

    //catch event when typing
    $("#txtMessage").focusin(function(){
        socket.emit("client_typing");
    });
    socket.on("typing_from_server",function(user_typing){
        $("#notify").html(user_typing+"<img width='20px' src ='typing.gif'>");

    });
    $("#txtMessage").focusout(function(){
        socket.emit("client_stop_typing");
    });
    socket.on("stop_typing_from_server",function(user_typing){
        $("#notify").html("");
        console.log("stop typing");
    });


    //Step 2: Client listen data from server (case failed)
    socket.on("server_send_failed", function(){
        alert("This account's already existed");
    });

    //Step 3: Client listen data from server (case success)
    socket.on("server_send_success", function(data_success_from_server){
        $("#currenUser").html(data_success_from_server);
        $("#loginForm").hide(1);// disappear in 1second
        $("#chatForm").show(1);// appear in 1second
    });
    //Step 4: recieve broadcast from server
    socket.on("server_send_broadcast", function(arr_broadcast_from_server){
        $("#boxContent").html("");
        //add new element to home.js at boxContent
        arr_broadcast_from_server.forEach(function(i){
            $("#boxContent").append("<div class = 'user'>"+ i +"</div>");
        });

    });

    
});

