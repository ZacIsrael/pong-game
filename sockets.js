

// keeps track of how many players/users/clients are ready to play 
let readyPlayerCount = 0;

function listen(io){
    // listen to the connection event, 
    // server will recieve this event everytime a user/client connects to it 
    io.on('connection', (socket) => {
        // socket used to communicate with the user/client that just connected 
        console.log(`User/client connected. socket.id= ${socket.id}`);

        // listen for the ready event
        socket.on('ready', () => {
            console.log(`User/client with socket.id= ${socket.id} is ready to play`);

            readyPlayerCount++;

            // Even number of players have connected
            if(readyPlayerCount % 2 === 0){
                // start the game
                // broadcast to both clients that the game is ready

                // lets all the clients know that the game is ready
                // second paramater: id of the client that will be the referee. In this case, it will always be the second player  
                io.emit('startGame', socket.id)
            }
        });

        socket.on('paddleMove', (paddleData) => {
            // paddleData object contains the x position of the current player's paddle 

            // send this data to the other player 
            socket.broadcast.emit('paddleMove', paddleData)
        });

        // listen for when the ball has moved 
        socket.on('ballMove', (ballData) => {
            // broadcast the x & y coordinates of the ball and the score to the opponent's browser
            socket.broadcast.emit('ballMove', ballData)
        });

        // listens for when a user/client disconnects for whatever reason
        // the socket will automatically try to reconnect with the client unless the server intentionally disconnected 
        socket.on('disconnect', (reason) => {
            // the reason parameter is the reason why that user/client disconnected 
            console.log(`User/client with socket.id=  ${socket.id} disconnected because ${reason}`)
        });
    });
}

module.exports = {
    listen
}