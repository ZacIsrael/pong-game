

// keeps track of how many players/users/clients are ready to play 
let readyPlayerCount = 0;

function listen(io){

    // connect to the pong name space
    const pongNameSpace = io.of('/pong');
    // listen to the connection event, 
    // server will recieve this event everytime a user/client connects to it 
    pongNameSpace.on('connection', (socket) => {
        // rooms group players into pairs
        let room;
        // socket used to communicate with the user/client that just connected 
        console.log(`User/client connected. socket.id= ${socket.id}`);

        // listen for the ready event
        socket.on('ready', () => {
     
            // the first & second users/clients will join room 0 (0/2 = 0, 1/2 = 0),
            // the 3rd and 4th users/clients will join room 1 (2/2 = 1, 3/2 = 1) and so on
            room = 'room' + Math.floor(readyPlayerCount/2);
            // the current client/user joins the room
            socket.join(room);

            console.log(`User/client with socket.id= ${socket.id} is ready to play\n They are in room ${room}\n`);

            readyPlayerCount++;

            // Even number of players have connected
            if(readyPlayerCount % 2 === 0){
                // start the game
                // broadcast to both clients that the game is ready

                // lets all the clients in the room know that the game is ready
                // second paramater: id of the client that will be the referee. In this case, it will always be the second player  
                pongNameSpace.in(room).emit('startGame', socket.id)

            }
        });

        socket.on('paddleMove', (paddleData) => {
            // paddleData object contains the x position of the current player's paddle 

            // send this data to the other player in the room  
            socket.to(room).emit('paddleMove', paddleData)
        });

        // listen for when the ball has moved 
        socket.on('ballMove', (ballData) => {
            // broadcast the x & y coordinates of the ball and the score to the opponent's browser (in the room)
            socket.to(room).emit('ballMove', ballData)
        });

        // listens for when a user/client disconnects for whatever reason
        // the socket will automatically try to reconnect with the client unless the server intentionally disconnected 
        socket.on('disconnect', (reason) => {
            // the reason parameter is the reason why that user/client disconnected 
            console.log(`User/client with socket.id=  ${socket.id} disconnected because ${reason}`)
            socket.leave(room);
        });
    });
}

module.exports = {
    listen
}