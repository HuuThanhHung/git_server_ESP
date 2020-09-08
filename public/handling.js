
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
                Json_pump_sts= ["Stop","Stop","Stop"]
                break;
            case 1:
                Json_pump_sts= ["Stop","Stop","Running"]
                break;
            case 10:
                Json_pump_sts= ["Stop","Running","Stop"]
                break;
            case 11:
                Json_pump_sts= ["Stop","Running","Running"]
                break;
            case 100:
                Json_pump_sts= ["Running","Stop","Stop"]
                break;
            case 111:
                Json_pump_sts= ["Running","Running","Running"]
                break;
            case 101:
                Json_pump_sts= ["Running","Stop","Running"]
                break; 
            case 110:
                Json_pump_sts= ["Running","Running","Stop"]
                break;                 
            }
            return Json_pump_sts;
    }

    function checkImage(Status_Pump)
    { 
        var image_arr =[3]
        switch (Status_Pump) {
            case 0:
                image_arr = ["red","red","red"]
                break;
            case 1:
                image_arr = ["red","red","green"]
                break;
            case 10:
                image_arr = ["red","green","red"]
                break;
            case 11:
                image_arr = ["red","green","green"]
                break;
            case 100:
                image_arr = ["green","red","red"]
                break;
            case 111:
                image_arr = ["green","green","green"]
                break;
            case 101:
                image_arr = ["red","red","green"]
                break; 
            case 110:
                image_arr = ["green","green","red"]
                break;                 
            }
            return image_arr;
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

    socket.on("login_response_success",function(MonthDate){
        $("#loginForm").hide(100); 
        $("#signupForm").hide(100);
        $("#boxLastName").html("");
        //$("#boxLastName").append("<div>Hi! "+ datahello +"</div>");
        $("#JsonDisplay").show(300);  
        $("#Mid").append("<div class = 'user'>"+ MonthDate[0] +" - "+ MonthDate[1] +"</div>");
        //step 2 Server send bradcast to all node
        socket.on("Old_data_from_server",function(db_chart){
            removeData(myChart);
            for(i=0;i<10;i++)
            {   
                addData2Chart(myChart, db_chart.db_time[i],"pH", db_chart.db_pH[i],"temp", db_chart.db_temp[i]);
            }

        });
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
            
            //alert(Json_from_Server.Status)
            if(Json_from_Server.Status == 1)        
            {
                $("#boxpH").html("");
                $("#boxTemp").html("");
                $("#boxpH").append("<div class = 'user'>"+ Json_from_Server.pH  + "</div>");
                $("#boxTemp").append("<div class = 'user'>"+ Json_from_Server.Temp +"&deg;C</div>");
                

            }
            else if(Json_from_Server.Status == 1)
            { 
                //do nothing
            }
            if(Json_from_Server.Status == 2)
            {
                $("#boxStatus").html("");
                $("#boxStatus").append("<div class = 'user' >Running ...</div>");
                document.getElementById("boxStatus").style.color = "blue";
            }
            if(Json_from_Server.Status == 3)
            {
                $("#boxStatus").html("");
                $("#boxStatus").append("<div class = 'user'>Stop</div>");
                document.getElementById("boxStatus").style.color = "red";
            }

            ArrPumstatus = checkPumpStatus(Json_from_Server.PumpStatus)
            ArrImage =   checkImage (Json_from_Server.PumpStatus)  
            $("#boxValveStatus2").append("<div class = 'user'>"+ ArrPumstatus[2]+"</div>");
            document.getElementById("boxValveStatus2").style.color = ArrImage[2];
            $("#boxpumpStatus6").append("<div class = 'user'>"+ ArrPumstatus[0] +"</div>");
            document.getElementById("boxpumpStatus6").style.color = ArrImage[0];
            $("#boxpumpStatus7").append("<div class = 'user'>"+ ArrPumstatus[1] +"</div>"); 
            document.getElementById("boxpumpStatus7").style.color = ArrImage[1];
   
        });
    });
});