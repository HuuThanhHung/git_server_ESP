// set up port, express for server
var express = require("express");
const { emit } = require("process");
const { Socket } = require("dgram");
var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");// set view de hien home
app.set("views", "./views");

var server = require("http").createServer(app);
var io = require("socket.io")(server);// set up SOCKET.IO
server.listen(1805);

io.on("connection", function(socket) {	
    console.log("Connected"); 
	console.log(socket.id);
	socket.emit("Server_to_ESP","Hello ESP 8266");

});

app.get("/",function(req, res){
    res.render("home");

});