// Game configuration
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SNAKE_LENGTH = 3;
const GAME_SPEED = 150; // milliseconds

// Game state
let canvas, ctx;
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = 0;
let gameLoop = null;
let isGameOver = false;

// DOM elements
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgain');
const topTenForm = document.getElementById('topTenForm');
const initialsInput = document.getElementById('initials');
const submitScoreBtn = document.getElementById('submitScore');

// Touch/click controls
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Load high score from localStorage
    highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    highScoreElement.textContent = highScore;

    // Set up event listeners
    document.addEventListener('keydown', handleKeyPress);
    playAgainBtn.addEventListener('click', resetGame);
    submitScoreBtn.addEventListener('click', handleScoreSubmit);
    
    // Touch controls
    upBtn.addEventListener('click', () => changeDirection(0, -1));
    downBtn.addEventListener('click', () => changeDirection(0, 1));
    leftBtn.addEventListener('click', () => changeDirection(-1, 0));
    rightBtn.addEventListener('click', () => changeDirection(1, 0));

    resetGame();
}

// Reset game to initial state
function resetGame() {
    // Initialize snake in the center
    snake = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({ x: INITIAL_SNAKE_LENGTH - i, y: Math.floor(GRID_SIZE / 2) });
    }

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    isGameOver = false;
    scoreElement.textContent = score;
    
    generateFood();
    
    gameScreen.classList.add('active');
    gameOverScreen.classList.remove('active');
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, GAME_SPEED);
}

// Generate food at random position
function generateFood() {
    let validPosition = false;
    
    while (!validPosition) {
        food.x = Math.floor(Math.random() * GRID_SIZE);
        food.y = Math.floor(Math.random() * GRID_SIZE);
        
        // Check if food spawns on snake
        validPosition = !snake.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    
    if (key === 'arrowup' || key === 'w') {
        changeDirection(0, -1);
    } else if (key === 'arrowdown' || key === 's') {
        changeDirection(0, 1);
    } else if (key === 'arrowleft' || key === 'a') {
        changeDirection(-1, 0);
    } else if (key === 'arrowright' || key === 'd') {
        changeDirection(1, 0);
    }
}

// Change snake direction (prevent 180-degree turns)
function changeDirection(x, y) {
    if (x !== -direction.x || y !== -direction.y) {
        nextDirection = { x, y };
    }
}

// Update game state
function update() {
    if (isGameOver) return;

    // Update direction
    direction = { ...nextDirection };

    // Calculate new head position
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    draw();
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#667eea' : '#764ba2';
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
        
        // Add eyes to head
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = 4;
            const eyeOffset = 6;
            
            if (direction.x === 1) { // Right
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - eyeOffset, segment.y * CELL_SIZE + CELL_SIZE - 9, eyeSize, eyeSize);
            } else if (direction.x === -1) { // Left
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset - eyeSize, segment.y * CELL_SIZE + 5, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + eyeOffset - eyeSize, segment.y * CELL_SIZE + CELL_SIZE - 9, eyeSize, eyeSize);
            } else if (direction.y === 1) { // Down
                ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 9, segment.y * CELL_SIZE + CELL_SIZE - eyeOffset, eyeSize, eyeSize);
            } else { // Up
                ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * CELL_SIZE + CELL_SIZE - 9, segment.y * CELL_SIZE + eyeOffset - eyeSize, eyeSize, eyeSize);
            }
        }
    });

    // Draw food
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// End game
function endGame() {
    isGameOver = true;
    clearInterval(gameLoop);
    
    finalScoreElement.textContent = score;
    
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('active');
    
    // Show form for any score > 0
    // The backend will determine if it makes the top 10
    if (score > 0) {
        topTenForm.style.display = 'block';
        initialsInput.value = '';
        initialsInput.focus();
    } else {
        topTenForm.style.display = 'none';
    }
}

// Handle score submission
function handleScoreSubmit() {
    const initials = initialsInput.value.trim().toUpperCase();
    
    if (initials.length === 0 || initials.length > 3) {
        alert('Please enter 1-3 characters for your initials');
        return;
    }
    
    // Send score to parent window (BucStop platform)
    if (window.parent !== window) {
        window.parent.postMessage({
            type: 'SUBMIT_SCORE',
            initials: initials,
            score: score
        }, '*');
    }
    
    // Disable form after submission
    submitScoreBtn.disabled = true;
    submitScoreBtn.textContent = 'Submitted!';
    
    // Listen for response from parent window with origin validation
    const messageHandler = (event) => {
        // Validate origin - only accept messages from parent (BucStop platform)
        // In a sandboxed iframe, we expect messages from the parent origin
        if (event.source !== window.parent) {
            return;
        }
        
        if (event.data.type === 'SCORE_SUBMITTED') {
            console.log('Score submitted successfully:', event.data.result);
            window.removeEventListener('message', messageHandler);
        } else if (event.data.type === 'SCORE_ERROR') {
            console.error('Score submission error:', event.data.error);
            submitScoreBtn.disabled = false;
            submitScoreBtn.textContent = 'Submit Score';
            alert('Failed to submit score. Please try again.');
            window.removeEventListener('message', messageHandler);
        }
    };
    
    window.addEventListener('message', messageHandler);
}

// Start the game when page loads
window.addEventListener('load', init);
