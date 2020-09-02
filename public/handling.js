
var socket = io("http://localhost:1805")
//var socket = io("http://3.18.143.29:1805")

$(document).ready(function(){
    $("#loginForm").show(200);
    $("#signupForm").hide();
    $("#tb_Usrname").html("");
    $("#tb_Psw").html("");
    $("#l_LoginFailed").hide();
    $("#l_SignupFail").hide();
    $("#l_SignupFailed").hide();
    $("#l_SignupFailedd").hide();
    $("#JsonDisplay").hide();
    $("#chatForm").hide();

    // function add data to chart
    function addData2Chart(chart, t_time, t_pH, t_pHVal,t_temp, t_tempval) {
        chart.data.labels.push(t_time);
        //chart.data.datasets.forEach((dataset) => {
            //dataset.data.push(data);
        //});
        //alert(chart.data.datasets[0].label)
       // alert(chart.data.datasets[1].label)
        var i = 0;
        for(i=0; i<2;i++)
        {
            if(chart.data.datasets[i].label == t_pH)
            {
                //alert("aaaaa")
                chart.data.datasets[i].data.push(t_pHVal); 
                
            }
            else if(chart.data.datasets[i].label == t_temp)
            {
                chart.data.datasets[i].data.push(t_tempval); 
            }
        }

        chart.update(0);
    }

    function removeData(chart) {
        chart.data.labels.splice(0, 10);
        for(i=0;i<2;i++)
        {
            chart.data.datasets[i].data.splice(0, 10);
        }
        

        chart.update();
    }

    function checkPumpStatus(Status_Pump)
    { 
        var Json_pump_sts =[3]
        switch (Status_Pump) {
            case 0:
                Json_pump_sts= ["Off","Off","Off"]
                break;
            case 1:
                Json_pump_sts= ["Off","Off","On"]
                break;
            case 10:
                Json_pump_sts= ["Off","On","Off"]
                break;
            case 11:
                Json_pump_sts= ["Off","On","On"]
                break;
            case 100:
                Json_pump_sts= ["On","Off","Off"]
                break;
            case 111:
                Json_pump_sts= ["On","On","On"]
                break;
            case 101:
                Json_pump_sts= ["On","Off","On"]
                break; 
            case 110:
                Json_pump_sts= ["On","On","Of"]
                break;                 
            }
            return Json_pump_sts;
    }

    //==================== Start ====================
    //sign up
    $("#btn_SignUp").click(function(){
        //location.href='/signup/';
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
            socket.on("signup_response_failed",function(){
                if($("#l_SignupFailedd").is(':visible'))
                {
                    $("#l_SignupFailedd").hide(100);
                }
                $("#l_SignupFail").show(300);
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
        
    });
    socket.on("login_response_success",function(datahello){
        $("#loginForm").hide(100); 
        $("#signupForm").hide(100);
        $("#boxLastName").html("");
        $("#boxLastName").append("<div>Hi! "+ datahello +"</div>");
        $("#JsonDisplay").show(300);              
        //step 2 Server send bradcast to all node
        socket.on("Sever_send_chart_Json",function(db_chart){

            //for(i =0;i < db_chart.ArrDB_pH.count();i++)
            //{
            removeData(myChart);
            for(i=0;i<10;i++)
            {
                addData2Chart(myChart, db_chart.db_time[i],"pH", db_chart.db_pH[i],"temp", db_chart.db_temp[i]);
            }
            //alert("add chart done!!")//debug
            
            //}
        });
        socket.on("Sever_send_ESP_Json",function(Json_from_Server){
            ArrPumstatus =[];
            $("#boxpumpStatus6").html("");
            $("#boxpumpStatus7").html("");  
            $("#boxValveStatus2").html("");
            $("#boxStatus").html("");
            
            if(Json_from_Server.Status == true)        
            {
                $("#boxpH").html("");
                $("#boxTemp").html("");
                $("#boxpH").append("<div class = 'user'>"+ Json_from_Server.pH  + "</div>");
                $("#boxTemp").append("<div class = 'user'>"+ Json_from_Server.Temp +"&deg;C</div>");
                $("#boxStatus").append("<div class = 'user' >Running ...</div>");
                document.getElementById("boxStatus").style.color = "blue";

            }
            else
            {
                $("#boxStatus").append("<div class = 'user'>Stop</div>");
                document.getElementById("boxStatus").style.color = "red";
            }
           
            ArrPumstatus = checkPumpStatus(Json_from_Server.PumpStatus)          
            $("#boxValveStatus2").append("<div class = 'user'>"+ ArrPumstatus[0] +"</div>");
            $("#boxpumpStatus6").append("<div class = 'user'>"+ ArrPumstatus[1] +"</div>");
            $("#boxpumpStatus7").append("<div class = 'user'>"+ ArrPumstatus[2] +"</div>"); 
            
            
            
            
        });
    });
});