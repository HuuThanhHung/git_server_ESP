const PORT = 1805;
 
var http = require('http');
var socketio = require('socket.io');
 
var ip = require('ip');
var app = http.createServer();
var io = socketio(app);
app.listen(PORT);
console.log("Server nodejs chay tai dia chi: " + ip.address() + ":" + PORT)

io.on('connection', function(socket) {	
    console.log("Connected"); 
	console.log(socket.id);
	socket.emit("Server_to_ESP","Hello ESP 8266");

});