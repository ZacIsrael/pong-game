const SERVER_URL = 'http://localhost:3000';

// Canvas Related 
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// socket io implicitly connects to the server
const socket = io();

let isReferee = false;
let paddleIndex = 0;

let width = 500;
let height = 700;

// Paddle
let paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleX = [ 225, 225 ];
let trajectoryX = [ 0, 0 ];
let playerMoved = false;

// Ball
// ballX & ballY represents which coordiantes the ball will be in on the screen 
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

// Speed
let speedY = 2;
let speedX = 0;


// Score for Both Players
let score = [ 0, 0 ];

// Create Canvas Element
function createCanvas() {
  canvas.id = 'canvas';
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

// Wait for Opponents, shows when player 1 is waiting for player 2 to join the game
function renderIntro() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = 'white';
  context.font = "32px Courier New";
  context.fillText("Waiting for opponent...", 20, (canvas.height / 2) - 30);
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Bottom Paddle
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Top Paddle
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = "32px Courier New";
  context.fillText(score[0], 20, (canvas.height / 2) + 50);
  context.fillText(score[1], 20, (canvas.height / 2) - 30);
}

// Reset Ball to Center
// called when the game has started or after a player has scored 
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = 3;

  // emit the score, and the x & y coordinates of the ball to the server vwhenever they change 
  socket.emit('ballMove', {
    ballX,
    ballY,
    score,
  });
}

// Adjust Ball Movement
// called everytime there has been an update to the ball's position 
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection;
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }
  // emit the score, and the x & y coordinates of the ball to the server vwhenever they change 
  socket.emit('ballMove', {
    ballX,
    ballY,
    score,
  });
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      // Reset Ball, add to Computer Score
      ballReset();
      score[1]++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      // Reset Ball, Increase Computer Difficulty, add to Player Score
      ballReset();
      score[0]++;
    }
  }
}


// Called Every Frame, called everytime the game is updated 
function animate() {
  // move the computer paddle 
  // computerAI();
  if(isReferee){
    // only the referee player can move the ball and keep track of where it is bouncing 
    ballMove();
    ballBoundaries();
  }
  renderCanvas();
  window.requestAnimationFrame(animate);
}

// Load Game, Reset Everything
function loadGame() {
  createCanvas();
  renderIntro();

  // tell the server that the client is ready to play, finished loading everything
  socket.emit('ready');
}

// starts the game 
function startGame(){
  // represents the paddle that the current player is controlling 
  // the user that is the referee controlls the paddle at the bottom of the screen,
  // the other user controls the paddle at the top of the screen 
  paddleIndex = isReferee ? 0 : 1;

  // tells the browser what needs to be done before the next repaint of the canvas
  window.requestAnimationFrame(animate);

  // listen and respond to user input 
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    paddleX[paddleIndex] = e.offsetX;
    if (paddleX[paddleIndex] < 0) {
      paddleX[paddleIndex] = 0;
    }
    if (paddleX[paddleIndex] > (width - paddleWidth)) {
      paddleX[paddleIndex] = width - paddleWidth;
    }

    // Send the current player's paddle position as it is being moved 
    // to the server so that the server can reemit the position to the opponent's browser
    // The paddles will now be in sync on both browsers  
    socket.emit('paddleMove', {
      // x position of the paddle as it has moved 
      xPosition: paddleX[paddleIndex]
    })
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}

// On Load
loadGame();

// listen to the connect event. connects the client/user to the server 
socket.on('connect', () => {
  // id of the socket session 
  console.log(`Connected. socket.id= ${socket.id}`);
});

// start the game (client side obviously)
socket.on('startGame', (refereeId) => {
  console.log(`Referee socket.id= ${socket.id}`);

  // the current client is the referee
  isReferee = socket.id === refereeId;
  // Now, start the game 
  startGame();

});

socket.on('paddleMove', (paddleData) => {
  // toggle between 1 & 0 depending on which user/client
  const opponentPaddleIndex = 1 - paddleIndex;
  // update the game state in this client/user to reflect the game state on the opponent's client 
  paddleX[opponentPaddleIndex] = paddleData.xPosition
});

socket.on('ballMove', (ballData) => {
  // Update the x & y coordinates of the ball and the score with the
  // data returned from the server
  ({ ballX, ballY, score } = ballData)
});
