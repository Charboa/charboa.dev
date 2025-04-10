const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

const contactInfo = "📧 charboadev@gmail.com";

const paddle = {
  width: 100,
  height: 10,
  x: 0,
  y: 0,
  speed: 7,
  dx: 0,
};

const ball = {
  x: 0,
  y: 0,
  radius: 8,
  speed: 4,
  dx: 4,
  dy: -4,
};

let bricks = [];
const brick = {
  rowCount: 4,
  columnCount: 6,
  width: 80,
  height: 20,
  padding: 10,
  offsetTop: 100,
  offsetLeft: 60,
};

let isGameRunning = false;
let isGameOver = false;

function initBricks() {
  bricks = [];
  for (let c = 0; c < brick.columnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brick.rowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

// Resize canvas dynamically based on window size (keeping it square)
function resizeCanvas() {
  // Set the canvas width and height to the smallest dimension
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.8; 
  canvas.width = size;
  canvas.height = size;

  // Update paddle, ball, and brick sizes based on new canvas size
  paddle.width = canvas.width / 5; 
  paddle.height = paddle.width * 5; 

  ball.radius = canvas.width / 60; // Adjust ball size based on canvas size
  ball.speed = canvas.width / 100; // Adjust ball speed based on canvas size

  // Update brick properties (size and position)
  brick.width = canvas.width / 8; // Make bricks proportional to canvas width
  brick.height = canvas.height / 40; // Make bricks proportional to canvas height

  brick.padding = canvas.width / 80; // Adjust the padding between bricks

  brick.offsetTop = canvas.height / 8; // Set bricks' offsetTop dynamically
  brick.offsetLeft = canvas.width / 10; // Set bricks' offsetLeft dynamically

  resetGame();
}

function startGame() {
  resetGame();
  isGameRunning = true;
}

// Function to reset ball position to the center
function resetBallPosition() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 50;
  ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = -4;
}

// Initialize bricks and reset game state
function resetGame() {
  paddle.x = canvas.width / 2 - paddle.width / 2; // Center paddle horizontally
  paddle.y = canvas.height - 20; // Place paddle at the bottom of the canvas
  paddle.dx = 0;

  initBricks(); 
  resetBallPosition();
  isGameOver = false;
  isGameRunning = false;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();  

// Draw paddle, ball, bricks, and contact info
function drawPaddle() {
  ctx.fillStyle = "#0ff";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brick.columnCount; c++) {
    for (let r = 0; r < brick.rowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brick.width + brick.padding) + brick.offsetLeft;
        const brickY = r * (brick.height + brick.padding) + brick.offsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.fillStyle = "#f0f";
        ctx.fillRect(brickX, brickY, brick.width, brick.height);
      }
    }
  }
}

function drawContactInfo() {
  ctx.font = "20px Courier New";
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.textAlign = "center";
  ctx.fillText(
    contactInfo,
    canvas.width / 2,
    brick.offsetTop + (brick.rowCount * (brick.height + brick.padding)) / 2
  );
}

function drawOverlayText(text) {
  ctx.font = "22px Courier New";
  ctx.fillStyle = "#0ff";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function collisionDetection() {
  for (let c = 0; c < brick.columnCount; c++) {
    for (let r = 0; r < brick.rowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          ball.x > b.x &&
          ball.x < b.x + brick.width &&
          ball.y > b.y &&
          ball.y < b.y + brick.height
        ) {
          ball.dy = -ball.dy;
          b.status = 0;
        }
      }
    }
  }
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width)
    paddle.x = canvas.width - paddle.width;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  if (
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy = -ball.dy;
  }

  if (ball.y - ball.radius > canvas.height) {
    isGameOver = true;
    isGameRunning = false;
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawContactInfo();
  drawBricks();
  drawPaddle();
  drawBall();

  if (!isGameRunning) {
    if (isGameOver) {
      drawOverlayText("Game Over — Click to Restart");
    } else {
      drawOverlayText("Click to Start");
    }
  }

  if (isGameRunning) {
    movePaddle();
    moveBall();
    collisionDetection();
  }

  requestAnimationFrame(update);
}

// Mobile touch controls
let touchStartX = 0;
 
function touchStart(e) {
  e.preventDefault();
  touchStartX = e.touches[0].clientX;
}

function touchMove(e) {
  e.preventDefault();
  if (!isGameRunning) return;

  const touchEndX = e.touches[0].clientX;
  const dx = touchEndX - touchStartX;
  paddle.x += dx;

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

  touchStartX = touchEndX;
}

function clickHandler() {
  if (!isGameRunning) {
    startGame();
  }
}

document.addEventListener("mousemove", (e) => {
  if (!isGameRunning) return;
  const relativeX = e.clientX - canvas.getBoundingClientRect().left;
  paddle.x = relativeX - paddle.width / 2;
});
document.addEventListener("click", clickHandler);
document.addEventListener("touchstart", touchStart);
document.addEventListener("touchmove", touchMove);

update();
