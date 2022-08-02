// this file serves as the entrypoint. 
// Contains the http server that will be attached to socket.io

// the server 
const server = require('http').createServer();

// attach socket.io to the server
const io = require('socket.io')(server, {
    // allows CORS
    cors: {
        // get & post reuqests from all origins 
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

const PORT = 3000;
server.listen(PORT);
console.log(`Listening on ${PORT}..`);

// keeps track of how many players/users/clients are ready to play 
let readyPlayerCount = 0;

// listen to the connection event, 
// server will recieve this event everytime a user/client connects to it 
io.on('connection', (socket) => {
    // socket used to communicate with the user/client that just connected 
    console.log(`User/client connected. socket.id= ${socket.id}`);

    // listen for the ready event
    socket.on('ready', () => {
        console.log(`User/client with socket.id= ${socket.id} is ready to play`);

        readyPlayerCount++;

        // 2 player game, 2 clients/users have connected 
        if(readyPlayerCount === 2){
            // start the game
            // broadcast to both clients that the game is ready

            // lets all the clients know that the game is ready
            // second paramater: id of the client that will be the referee. In this case, it will always be the second player  
            io.emit('startGame', socket.id)
        }
    })
});