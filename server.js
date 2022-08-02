// this file serves as the entrypoint. 
// Contains the http server that will be attached to socket.io

// the server 
const server = require('http').createServer();

// attach socket.io to the server
const io = require('socket.io')(server);

const PORT = 3000;
server.listen(PORT);
console.log(`Listening on ${PORT}..`);

// listen to the connection event, 
// server will recieve this event everytime a user/client connects to it 
io.on('connection', (socket) => {
    // socket used to communicate with the user/client that just connected 
    console.log('a user connected');
});