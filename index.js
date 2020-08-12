// set up port, express for server
var express = require("express");
var Excel = require("exceljs");
const { emit } = require("process");
const { Socket } = require("dgram");
var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");// set view when render home page
app.set("views", "./views");

var server = require("http").createServer(app);
var io = require("socket.io")(server);// set up SOCKET.IO
server.listen(1805);

//create function to parse JSON data to object
function PareseJSONdata(JsonData){
    try {
        return JSON.parse(JsonData);
    } 
    catch (error) {
        console.log("No Json data found");
        return null;
    }
}
var workbook = new Excel.Workbook(); 
var filename = "database.xlsx";
  

io.on("connection", function(socket) {	
    console.log(socket.id);//debug
    // ================ Server and ESP ==========================
    //step 1.0 create connection with ESP
    socket.on("connect_ESP_server",function(data_from_ESP){
        console.log(data_from_ESP);
    });
    
    //step 1.1 receive Json data from ESP
    socket.on("Json_from_ESP",function(Json_from_ESP){
        // data Json format from ESP { pH: 18, EC: 5, Temp: 19, PumpStatus: 97 }
        console.log(Json_from_ESP.pH);//debug
        console.log(Json_from_ESP.EC);//debug
        console.log(Json_from_ESP.Temp);//debug
        console.log(JSON.stringify(Json_from_ESP.PumpStatus));//debug
        
        //step 2 Server send bradcast to all node
        //when receive data from ESP server will send new data broadcast to all node
        socket.broadcast.emit("Sever_send_ESP_Json",Json_from_ESP);
    });

    // ================ Server and another node =================
    //step 3.1 client request login
    socket.on("user_login",function(LogIndata){
        console.log(LogIndata.name);//debug
        console.log(LogIndata.password)//debug

        //step 3.2 server check password and send back response      
        workbook.xlsx.readFile(filename).then(function() {
            var worksheet = workbook.getWorksheet("UserInfor");
            console.log("Number of row "+worksheet.rowCount);
            for(i =1; i <= worksheet.rowCount; i++)
            {
                var row = worksheet.getRow(i);
                console.log(row.getCell("A").value);
                //console.log(row.getCell("B").value);
                //console.log(row.getCell("C").value);
                //console.log(row.getCell("D").value);
                if(LogIndata.name == row.getCell("A").value && LogIndata.password == row.getCell("B").value)
                {   
                    socket.emit("login_response_success");
                }
                else
                {
                    socket.emit("login_response_failed");
                }
            }
            
        });
        
    });

    //sign up data recieve from client
    socket.on("user_signup",function(SignUpdata){      
        workbook.xlsx.readFile(filename).then(function() {
            var worksheet = workbook.getWorksheet("UserInfor");
            
            var i = 0;
            var breakTheLoop = false;
            var count = worksheet.rowCount;
            var Endrow;
            console.log("Number of row "+  count);//debug
            do{
                i = i + 1;
                var row = worksheet.getRow(i);
                
                if(SignUpdata.UrsName == row.getCell("A").value)
                {
                    socket.emit("signup_response_failed");
                    breakTheLoop = true;
                }
            } while (i <= count && !breakTheLoop);
            Endrow = i;
            console.log(SignUpdata.UrsName);//debug
            if(!breakTheLoop)//not found any name same
            {
                socket.emit("signup_response_success");
                var Ar1 = [];
                for(var j in SignUpdata) {
                    Ar1.push(SignUpdata[j]);
                }
                console.log(Ar1);//debug
                worksheet.addRow(Ar1,3);
                workbook.xlsx.writeFile(filename).then(function() {
                    console.log('Array added and then file saved.')
                });
            }
            
            
        });

    });

    
    
    
});

app.get("/",function(req, res){
    res.render("home");

});