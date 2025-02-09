const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables
let gameState = "countdown"; // can be 'countdown', 'playing', 'gameOver'
let countdownTime = 3;
let wave = 1;
let player, finishLine, opponents;
let lastTime = 0;
let playerDirection = 0; // left = -1, right = 1

// Player object
function createPlayer() {
    player = {
        x: canvas.width / 2,
        y: 50,
        radius: 15,
        speed: 1,
    };
}

// Opponent object
function createOpponents() {
    opponents = [];
    for (let i = 0; i < wave + 1; i++) {
        opponents.push({
            x: Math.random() * canvas.width,
            y: canvas.height - (i + 1) * 50,
            radius: 15,
            speed: Math.random() * 0.5 + 0.5, // Random speed for each opponent
        });
    }
}

// Finish line object
function createFinishLine() {
    finishLine = {
        y: canvas.height - 30,
        width: canvas.width,
        height: 10,
    };
}

// Reset game
function resetGame() {
    gameState = "countdown";
    wave = 1;
    createPlayer();
    createFinishLine();
    createOpponents();
}

// Collision detection function
function checkCollision() {
    for (let i = 0; i < opponents.length; i++) {
        let dx = player.x - opponents[i].x;
        let dy = player.y - opponents[i].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + opponents[i].radius) {
            return true;
        }
    }
    return false;
}

// Update function
function update(deltaTime) {
    if (gameState === "countdown") {
        countdownTime -= deltaTime / 1000;
        if (countdownTime <= 0) {
            gameState = "playing";
            createPlayer();
            createOpponents();
            countdownTime = 3;
        }
    } else if (gameState === "playing") {
        player.x += playerDirection * player.speed; // Player moves left or right
        player.x = Math.max(0, Math.min(canvas.width, player.x)); // Keep player within canvas

        // Move opponents
        for (let i = 0; i < opponents.length; i++) {
            opponents[i].y -= opponents[i].speed; // Move upwards
            opponents[i].x += (Math.random() - 0.5) * 2; // Random left or right movement
        }

        // Check if player reaches finish line
        if (player.y > finishLine.y) {
            gameState = "countdown"; // Reset after finishing the line
            canvas.height -= 50; // Shift the screen up after each wave
            wave++;
            countdownTime = 3;
        }

        // Check for collisions
        if (checkCollision()) {
            gameState = "gameOver";
        }
    } else if (gameState === "gameOver") {
        resetGame();
    }
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the screen

    if (gameState === "countdown") {
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText(`Starting in ${Math.ceil(countdownTime)}`, canvas.width / 2 - 150, canvas.height / 2);
    } else if (gameState === "playing") {
        // Draw the player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();

        // Draw the finish line
        ctx.fillStyle = "white";
        ctx.fillRect(0, finishLine.y, finishLine.width, finishLine.height);

        // Draw the opponents
        for (let i = 0; i < opponents.length; i++) {
            ctx.beginPath();
            ctx.arc(opponents[i].x, opponents[i].y, opponents[i].radius, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();
        }

        // Draw the player’s axis
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(player.x, 0);
        ctx.lineTo(player.x, canvas.height);
        ctx.stroke();
    } else if (gameState === "gameOver") {
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 120, canvas.height / 2);
        ctx.fillText("Restarting...", canvas.width / 2 - 120, canvas.height / 2 + 50);
    }
}

// Handle mouse click for player movement (for desktop)
canvas.addEventListener("click", (e) => {
    const clickX = e.clientX;
    const playerCenterX = player.x;

    if (clickX < playerCenterX) {
        playerDirection = -1; // Move left
    } else if (clickX > playerCenterX) {
        playerDirection = 1; // Move right
    }
});

// Handle screen tap for player movement (for mobile)
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent default touch behavior (scrolling, zooming, etc.)

    const touchX = e.touches[0].clientX;
    const playerCenterX = player.x;

    if (touchX < playerCenterX) {
        playerDirection = -1; // Move left
    } else if (touchX > playerCenterX) {
        playerDirection = 1; // Move right
    }
}, false);

// Game loop function
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
resetGame();
requestAnimationFrame(gameLoop);
