// Game Variables
const gameBoard = document.getElementById('gameBoard');
const ball = document.getElementById('ball');
const playerPaddle = document.getElementById('playerPaddle');
const computerPaddle = document.getElementById('computerPaddle');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game Constants
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const BALL_SPEED = 4;
const COMPUTER_SPEED = 5;

// Game State
let gameState = {
    ballX: BOARD_WIDTH / 2,
    ballY: BOARD_HEIGHT / 2,
    ballSpeedX: BALL_SPEED,
    ballSpeedY: BALL_SPEED,
    playerY: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    computerY: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    playerScore: 0,
    computerScore: 0,
    gameRunning: false,
    keys: {
        arrowUp: false,
        arrowDown: false
    },
    mouseY: BOARD_HEIGHT / 2
};

// Event Listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetScore);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
gameBoard.addEventListener('mousemove', handleMouseMove);

// Keyboard Controls
function handleKeyDown(event) {
    if (event.key === 'ArrowUp') gameState.keys.arrowUp = true;
    if (event.key === 'ArrowDown') gameState.keys.arrowDown = true;
}

function handleKeyUp(event) {
    if (event.key === 'ArrowUp') gameState.keys.arrowUp = false;
    if (event.key === 'ArrowDown') gameState.keys.arrowDown = false;
}

// Mouse Controls
function handleMouseMove(event) {
    const rect = gameBoard.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    gameState.mouseY = Math.max(0, Math.min(mouseY - PADDLE_HEIGHT / 2, BOARD_HEIGHT - PADDLE_HEIGHT));
}

// Start Game
function startGame() {
    if (!gameState.gameRunning) {
        gameState.gameRunning = true;
        resetBall();
        startBtn.textContent = 'Game Running...';
        startBtn.disabled = true;
        gameLoop();
    }
}

// Reset Score
function resetScore() {
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.gameRunning = false;
    resetBall();
    updateScoreboard();
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
    drawGame();
}

// Reset Ball
function resetBall() {
    gameState.ballX = BOARD_WIDTH / 2 - BALL_SIZE / 2;
    gameState.ballY = BOARD_HEIGHT / 2 - BALL_SIZE / 2;
    gameState.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
    gameState.ballSpeedY = (Math.random() - 0.5) * BALL_SPEED * 2;
    gameState.playerY = BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    gameState.computerY = BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2;
}

// Update Player Paddle Position
function updatePlayerPaddle() {
    // Use mouse position
    gameState.playerY = gameState.mouseY;

    // Keyboard controls override mouse if keys are pressed
    if (gameState.keys.arrowUp) {
        gameState.playerY = Math.max(0, gameState.playerY - PADDLE_SPEED);
    }
    if (gameState.keys.arrowDown) {
        gameState.playerY = Math.min(BOARD_HEIGHT - PADDLE_HEIGHT, gameState.playerY + PADDLE_SPEED);
    }

    // Ensure paddle stays within bounds
    gameState.playerY = Math.max(0, Math.min(gameState.playerY, BOARD_HEIGHT - PADDLE_HEIGHT));
}

// Update Computer Paddle Position (AI)
function updateComputerPaddle() {
    const computerCenter = gameState.computerY + PADDLE_HEIGHT / 2;
    const ballCenter = gameState.ballY + BALL_SIZE / 2;

    if (computerCenter < ballCenter - 35) {
        gameState.computerY = Math.min(BOARD_HEIGHT - PADDLE_HEIGHT, gameState.computerY + COMPUTER_SPEED);
    } else if (computerCenter > ballCenter + 35) {
        gameState.computerY = Math.max(0, gameState.computerY - COMPUTER_SPEED);
    }
}

// Update Ball Position
function updateBall() {
    gameState.ballX += gameState.ballSpeedX;
    gameState.ballY += gameState.ballSpeedY;

    // Ball collision with top and bottom walls
    if (gameState.ballY <= 0 || gameState.ballY + BALL_SIZE >= BOARD_HEIGHT) {
        gameState.ballSpeedY = -gameState.ballSpeedY;
        gameState.ballY = Math.max(0, Math.min(gameState.ballY, BOARD_HEIGHT - BALL_SIZE));
    }

    // Ball collision with paddles
    checkPaddleCollision();

    // Ball out of bounds (scoring)
    if (gameState.ballX < -BALL_SIZE) {
        gameState.computerScore++;
        updateScoreboard();
        resetBall();
    } else if (gameState.ballX > BOARD_WIDTH) {
        gameState.playerScore++;
        updateScoreboard();
        resetBall();
    }
}

// Check Paddle Collision
function checkPaddleCollision() {
    // Player Paddle Collision
    if (
        gameState.ballX <= PADDLE_WIDTH + 10 &&
        gameState.ballX + BALL_SIZE >= 10 &&
        gameState.ballY >= gameState.playerY &&
        gameState.ballY + BALL_SIZE <= gameState.playerY + PADDLE_HEIGHT
    ) {
        gameState.ballSpeedX = Math.abs(gameState.ballSpeedX);
        gameState.ballX = PADDLE_WIDTH + 10;

        // Add spin based on where the ball hits the paddle
        const hitPos = gameState.ballY - gameState.playerY;
        gameState.ballSpeedY = (hitPos - PADDLE_HEIGHT / 2) * 0.1;
    }

    // Computer Paddle Collision
    if (
        gameState.ballX + BALL_SIZE >= BOARD_WIDTH - PADDLE_WIDTH - 10 &&
        gameState.ballX <= BOARD_WIDTH - 10 &&
        gameState.ballY >= gameState.computerY &&
        gameState.ballY + BALL_SIZE <= gameState.computerY + PADDLE_HEIGHT
    ) {
        gameState.ballSpeedX = -Math.abs(gameState.ballSpeedX);
        gameState.ballX = BOARD_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE;

        // Add spin based on where the ball hits the paddle
        const hitPos = gameState.ballY - gameState.computerY;
        gameState.ballSpeedY = (hitPos - PADDLE_HEIGHT / 2) * 0.1;
    }
}

// Update Scoreboard
function updateScoreboard() {
    playerScoreDisplay.textContent = gameState.playerScore;
    computerScoreDisplay.textContent = gameState.computerScore;
}

// Draw Game Elements
function drawGame() {
    // Update paddle positions
    playerPaddle.style.top = gameState.playerY + 'px';
    computerPaddle.style.top = gameState.computerY + 'px';

    // Update ball position
    ball.style.left = gameState.ballX + 'px';
    ball.style.top = gameState.ballY + 'px';
}

// Game Loop
function gameLoop() {
    if (gameState.gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
        drawGame();
        requestAnimationFrame(gameLoop);
    }
}

// Initial Draw
drawGame();
updateScoreboard();	
