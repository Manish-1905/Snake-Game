const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
// Load sound effects
const crunchSound = new Audio("crunch.mp3");
const bangSound = new Audio("bang.mp3");
const highscoreSound = new Audio("highscore.mp3");
const gameOverSound = new Audio("gameover.mp3");
// Background music
const bgMusic = new Audio("background.mp3");
bgMusic.loop = true; // loop continuously
bgMusic.volume = 0.5; // optional: set volume to 50%


const tileSize = 40;
let snake, dx, dy, food, score, gameInterval;
let highScore = sessionStorage.getItem("snakeHighScore") || 0;
highScoreElement.textContent = "High Score: " + highScore;

let showGameOverScreen = true; // show start button initially
let buttonArea = null;
let hoverButton = false;

function initGame() {
  snake = [{x: 200, y: 200}];
  dx = tileSize;
  dy = 0;
  food = {x: 120, y: 120};
  score = 0;
  scoreElement.textContent = "Score: " + score;
}

function drawBackground() {
  for (let row = 0; row < canvas.height / tileSize; row++) {
    for (let col = 0; col < canvas.width / tileSize; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#add8e6" : "#87ceeb";
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    ctx.fillStyle = "green"; // same color for head and body

    if (i === 0) {
      // Head as triangle
      ctx.beginPath();
      if (dx > 0) { // moving right
        ctx.moveTo(segment.x, segment.y);
        ctx.lineTo(segment.x, segment.y + tileSize);
        ctx.lineTo(segment.x + tileSize, segment.y + tileSize / 2);
      } else if (dx < 0) { // moving left
        ctx.moveTo(segment.x + tileSize, segment.y);
        ctx.lineTo(segment.x + tileSize, segment.y + tileSize);
        ctx.lineTo(segment.x, segment.y + tileSize / 2);
      } else if (dy > 0) { // moving down
        ctx.moveTo(segment.x, segment.y);
        ctx.lineTo(segment.x + tileSize, segment.y);
        ctx.lineTo(segment.x + tileSize / 2, segment.y + tileSize);
      } else if (dy < 0) { // moving up
        ctx.moveTo(segment.x, segment.y + tileSize);
        ctx.lineTo(segment.x + tileSize, segment.y + tileSize);
        ctx.lineTo(segment.x + tileSize / 2, segment.y);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Body as square
      ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
    }
  }
}


function drawFood() {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x + tileSize / 2, food.y + tileSize / 2, tileSize / 2 - 4, 0, Math.PI * 2);
  ctx.fill();
}

function checkCollision() {
  const head = snake[0];
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    endGame();
  }
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
    }
  }
}

function placeFood() {
  let newFood, collision;
  do {
    newFood = {
      x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
      y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize
    };
    collision = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  } while (collision);
  food = newFood;
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    crunchSound.play(); // ✅ play crunch sound
    scoreElement.textContent = "Score: " + score;
    if (score > highScore) {
      highScore = score;
      sessionStorage.setItem("snakeHighScore", highScore); // ✅ sessionStorage
      highScoreElement.textContent = "High Score: " + highScore;

      if(!newRecord){
        highscoreSound.play();
        newRecord=true;
      }
      localStorage.setItem("snakeHighScore", highScore);
      highScoreElement.textContent = "High Score: " + highScore;
    } 
    placeFood();
  } else {
    snake.pop();
  }

  drawSnake();
  drawFood();
  checkCollision();
}

function startGame() {
  if (!gameInterval) {
    initGame();
    showGameOverScreen = false;
    newRecord = false;
    gameInterval = setInterval(updateGame, 100);
    bgMusic.currentTime = 2; // reset to start
    bgMusic.play(); // start background music
  }
}

function endGame() {
  clearInterval(gameInterval);
  gameInterval = null;

  bangSound.play(); // play bang sound
  gameOverSound.play();   // new Game Over sound

  bgMusic.pause();        // stop background music
  bgMusic.currentTime = 2; // reset so it starts fresh next time

  showGameOverScreen = true;
  drawGameOverScreen();
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  if (score > 0 || highScore > 0) {
    ctx.font = "48px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);
    ctx.font = "32px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText("High Score: " + highScore, canvas.width / 2, canvas.height / 2 + 30);
  }

  // Draw Start Game button
  const btnWidth = 200;
  const btnHeight = 50;
  const btnX = canvas.width / 2 - btnWidth / 2;
  const btnY = canvas.height / 2 + 80;

  ctx.fillStyle = hoverButton ? "#0056b3" : "#007bff";
  ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Start Game", canvas.width / 2, btnY + 32);

  buttonArea = {x: btnX, y: btnY, width: btnWidth, height: btnHeight};
}

canvas.addEventListener("click", function(e) {
  if (showGameOverScreen && buttonArea) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX >= buttonArea.x && clickX <= buttonArea.x + buttonArea.width &&
        clickY >= buttonArea.y && clickY <= buttonArea.y + buttonArea.height) {
      startGame();
    }
  }
});

canvas.addEventListener("mousemove", function(e) {
  if (showGameOverScreen && buttonArea) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    hoverButton = (mouseX >= buttonArea.x && mouseX <= buttonArea.x + buttonArea.width &&
                   mouseY >= buttonArea.y && mouseY <= buttonArea.y + buttonArea.height);

    if (showGameOverScreen) {
      drawGameOverScreen();
    }
  }
});

// Draw the initial start screen when the page loads
document.addEventListener("keydown", event => {
  if (!showGameOverScreen) {
    if (event.key === "ArrowUp" && dy === 0) {
      dx = 0;
      dy = -tileSize;
    } else if (event.key === "ArrowDown" && dy === 0) {
      dx = 0;
      dy = tileSize;
    } else if (event.key === "ArrowLeft" && dx === 0) {
      dx = -tileSize;
      dy = 0;
    } else if (event.key === "ArrowRight" && dx === 0) {
      dx = tileSize;
      dy = 0;
    }
  }
});

// Draw the initial Start Game screen when the page loads
drawGameOverScreen();

window.addEventListener("beforeunload", () => {
  score = 0;
  scoreElement.textContent = "Score: 0";
  highScore = 0;
  highScoreElement.textContent = "High Score: 0";
});
