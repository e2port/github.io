const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables
let gameState = "countdown"; // can be 'countdown' or 'playing'
let countdownTime = 3;
let wave = 1;
let player, finishLine, opponents;
let lastTime = 0;
let playerDirection = 0; // left = -1, right = 1

// Create the player (football) with an oval shape
function createPlayer() {
    player = {
        x: canvas.width / 2,
        y: 50,        // Start near the top
        radius: 15,   // Base size (used for collision and drawing)
        speed: 2      // Speed for both horizontal and vertical movement
    };
}

// Create the opponents (upward-pointing triangles)
// Their count increases with each wave (wave + 1 opponents)
function createOpponents() {
    opponents = [];
    for (let i = 0; i < wave + 1; i++) {
        opponents.push({
            x: Math.random() * canvas.width,
            // Position them near the bottom; spacing them 50px apart vertically
            y: canvas.height - (i + 1) * 50,
            radius: 15, // Base size for drawing; will be doubled when rendered
            speed: Math.random() * 0.5 + 0.5 // Random upward speed for each opponent
        });
    }
}

// Create the finish line positioned a few pixels above the bottom of the screen
function createFinishLine() {
    finishLine = {
        y: canvas.height - 30,
        width: canvas.width,
        height: 10
    };
}

// Reset game (or full restart after a collision)
function resetGame() {
    gameState = "countdown";
    wave = 1;
    createPlayer();
    createFinishLine();
    createOpponents();
    countdownTime = 3;
    playerDirection = 0;
}

// Approximate collision detection using circle bounds
function checkCollision() {
    for (let i = 0; i < opponents.length; i++) {
        let dx = player.x - opponents[i].x;
        let dy = player.y - opponents[i].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + opponents[i].radius * 2) {
            // Using opponents[i].radius * 2 since they are drawn twice as large.
            return true;
        }
    }
    return false;
}

// Draw an upward-pointing triangle centered at (x, y)
// The triangle’s size (half-height) is provided in "size"
function drawTriangle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);       // Top vertex
    ctx.lineTo(x - size, y + size);  // Bottom left vertex
    ctx.lineTo(x + size, y + size);  // Bottom right vertex
    ctx.closePath();
    ctx.fill();
}

// Update game objects based on elapsed time
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
        // Update the football’s position:
        // Move horizontally based on user input and vertically downward automatically.
        player.x += playerDirection * player.speed;
        player.y += player.speed;
        // Keep the player within horizontal bounds.
        player.x = Math.max(0, Math.min(canvas.width, player.x));
        
        // Update opponents: they move upward and shift erratically horizontally.
        for (let i = 0; i < opponents.length; i++) {
            opponents[i].y -= opponents[i].speed; // Move upward.
            opponents[i].x += (Math.random() - 0.5) * 4; // More erratic horizontal movement.
        }
        
        // Check if the football has reached the finish line (bottom of the screen).
        if (player.y > finishLine.y) {
            // Wave completed: increment wave, then reset finish line and objects.
            wave++;
            createFinishLine();    // Always position the finish line at canvas.height - 30.
            createPlayer();        // Reset the football to the top.
            createOpponents();     // Generate a new (increased) set of opponents.
            gameState = "countdown";
            countdownTime = 3;
            playerDirection = 0;
        }
        
        // Check for collisions: if the football hits any triangle, reset the entire game.
        if (checkCollision()) {
            resetGame();
        }
    }
}

// Draw all game elements on the canvas.
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === "countdown") {
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText(`Starting in ${Math.ceil(countdownTime)}`, canvas.width / 2 - 150, canvas.height / 2);
    } else if (gameState === "playing") {
        // Draw the football as an oval (ellipse) with a hazel color.
        ctx.fillStyle = "#8E7618";
        ctx.beginPath();
        // The football's horizontal radius is player.radius,
        // and vertical radius is 1.5 times that.
        ctx.ellipse(player.x, player.y, player.radius, player.radius * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the finish line.
        ctx.fillStyle = "white";
        ctx.fillRect(0, finishLine.y, finishLine.width, finishLine.height);
        
        // Draw each opponent as an upward-pointing triangle (twice the base size).
        ctx.fillStyle = "white";
        for (let i = 0; i < opponents.length; i++) {
            // Multiply the opponent radius by 2 to make the triangles twice as big.
            drawTriangle(opponents[i].x, opponents[i].y, opponents[i].radius * 2);
        }
        
        // Optionally, draw a vertical axis line through the football.
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(player.x, 0);
        ctx.lineTo(player.x, canvas.height);
        ctx.stroke();
    }
    
    // Draw the wave counter in the top right corner.
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Wave: ${wave}`, canvas.width - 20, 40);
    ctx.textAlign = "start";
}

// Handle mouse clicks (desktop) for player movement.
canvas.addEventListener("click", (e) => {
    const clickX = e.clientX;
    const playerCenterX = player.x;
    
    if (clickX < playerCenterX) {
        playerDirection = -1; // Move left.
    } else if (clickX > playerCenterX) {
        playerDirection = 1; // Move right.
    }
});

// Handle screen taps (mobile) for player movement.
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent default touch behavior (scrolling, zooming, etc.)
    
    const touchX = e.touches[0].clientX;
    const playerCenterX = player.x;
    
    if (touchX < playerCenterX) {
        playerDirection = -1; // Move left.
    } else if (touchX > playerCenterX) {
        playerDirection = 1; // Move right.
    }
}, false);

// The main game loop.
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game.
resetGame();
requestAnimationFrame(gameLoop);
