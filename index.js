// set up port, express for server
var express = require("express");
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


});

app.get("/",function(req, res){
    res.render("home");

});