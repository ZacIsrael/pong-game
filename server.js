// this file serves as the entrypoint. 
// Contains the http server that will be attached to socket.io


const http = require('http');
const io = require('socket.io');

// the api server
const apiServer = require('./api');
// the http server 
const httpServer = http.createServer(apiServer);

// attach socket.io to the http server
const socketServer = io(httpServer, {
    // allows CORS
    cors: {
        // get & post reuqests from all origins 
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

const sockets = require('./sockets');

const PORT = 3000;
httpServer.listen(PORT);
console.log(`Listening on ${PORT}..`);

sockets.listen(socketServer);


