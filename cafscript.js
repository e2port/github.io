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
        y: 50,        // start near the top
        radius: 15,   // base size (used for collision and drawing)
        speed: 2      // speed used for both horizontal and vertical movement
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
            radius: 15, // used as the “size” of the triangle
            speed: Math.random() * 0.5 + 0.5 // random upward speed
        });
    }
}

// Create the finish line (a horizontal line near the bottom)
function createFinishLine() {
    finishLine = {
        y: canvas.height - 30,
        width: canvas.width,
        height: 10
    };
}

// Reset the game (called at the start or after a collision)
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
        if (distance < player.radius + opponents[i].radius) {
            return true;
        }
    }
    return false;
}

// Draw an upward-pointing triangle centered at (x, y)
// The triangle’s vertices are computed so that its centroid is (x,y)
function drawTriangle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);       // top vertex
    ctx.lineTo(x - size, y + size);  // bottom left vertex
    ctx.lineTo(x + size, y + size);  // bottom right vertex
    ctx.closePath();
    ctx.fill();
}

// Update the game objects based on the elapsed time
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
        // Move horizontally according to the user's input and vertically downward automatically.
        player.x += playerDirection * player.speed;
        player.y += player.speed;
        // Keep the player within horizontal bounds.
        player.x = Math.max(0, Math.min(canvas.width, player.x));
        
        // Update opponents: they move upward and shift erratically horizontally.
        for (let i = 0; i < opponents.length; i++) {
            opponents[i].y -= opponents[i].speed; // Move upward.
            opponents[i].x += (Math.random() - 0.5) * 4; // Erratic horizontal movement.
        }
        
        // Check if the football has reached the finish line (bottom of the screen).
        if (player.y > finishLine.y) {
            // Wave completed: shift finish line upward, increase wave count, and reset player & opponents.
            wave++;
            finishLine.y -= 50;  // Simulate the screen shifting upward.
            createPlayer();      // Reset the football to the top.
            createOpponents();   // Generate a new (larger) set of opponents.
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
        // Draw the football as an oval (ellipse) to simulate a football shape.
        ctx.fillStyle = "white";
        ctx.beginPath();
        // The football's horizontal radius is player.radius, and vertical radius is 1.5 times that.
        ctx.ellipse(player.x, player.y, player.radius, player.radius * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the finish line.
        ctx.fillStyle = "white";
        ctx.fillRect(0, finishLine.y, finishLine.width, finishLine.height);
        
        // Draw each opponent as an upward-pointing triangle.
        ctx.fillStyle = "white";
        for (let i = 0; i < opponents.length; i++) {
            drawTriangle(opponents[i].x, opponents[i].y, opponents[i].radius);
        }
        
        // Optionally, draw a vertical axis line through the football.
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(player.x, 0);
        ctx.lineTo(player.x, canvas.height);
        ctx.stroke();
    }
}

// Listen for clicks (desktop) to set the horizontal movement direction.
canvas.addEventListener("click", (e) => {
    const clickX = e.clientX;
    const playerCenterX = player.x;
    
    if (clickX < playerCenterX) {
        playerDirection = -1; // Move left.
    } else if (clickX > playerCenterX) {
        playerDirection = 1; // Move right.
    }
});

// Listen for touches (mobile) to set the horizontal movement direction.
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent default behaviors like scrolling.
    
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
