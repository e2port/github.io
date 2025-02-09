const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables
let gameState = "countdown"; // can be 'countdown' or 'playing'
let countdownTime = 2;       // countdown is now 2 seconds
let wave = 1;
let player, finishLine, opponents;
let lastTime = 0;
let playerDirection = 0; // left = -1, right = 1
let opponentsColor = "white"; // default color for opponents

// Utility: Returns a random hex color string.
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Create the player (football) with an oval shape.
function createPlayer() {
    player = {
        x: canvas.width / 2,
        y: 50,        // start near the top
        radius: 15,   // base size (used for collision and drawing)
        speed: 3      // speed for both horizontal and vertical movement
    };
}

// Create the opponents (upward-pointing triangles).
// Their count increases by 2 each wave: wave 1 = 2, wave 2 = 4, etc.
function createOpponents() {
    // Every 3 rounds, change the opponents' color.
    if (wave % 3 === 1) {
        opponentsColor = getRandomColor();
    }
    
    opponents = [];
    const count = wave * 2; // 2 opponents per wave number.
    for (let i = 0; i < count; i++) {
        opponents.push({
            x: Math.random() * canvas.width,
            // Position them near the bottom; spacing them 50px apart vertically.
            y: canvas.height - (i + 1) * 50,
            radius: 15, // Base size for drawing; will be doubled when rendered.
            speed: Math.random() * 0.5 + 0.5 // Random upward speed for each opponent.
        });
    }
}

// Create the finish line positioned a few pixels above the bottom of the screen.
function createFinishLine() {
    finishLine = {
        y: canvas.height - 30,
        width: canvas.width,
        height: 10
    };
}

// Reset game (or full restart after a collision).
function resetGame() {
    gameState = "countdown";
    wave = 1;
    createPlayer();
    createFinishLine();
    createOpponents();
    countdownTime = 2;
    playerDirection = 0;
}

// Approximate collision detection using circle bounds.
function checkCollision() {
    for (let i = 0; i < opponents.length; i++) {
        let dx = player.x - opponents[i].x;
        let dy = player.y - opponents[i].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        // Use opponents[i].radius * 2 because the triangles are drawn twice as big.
        if (distance < player.radius + opponents[i].radius * 2) {
            return true;
        }
    }
    return false;
}

// Draw an upward-pointing triangle centered at (x, y) with half-height "size".
function drawTriangle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);       // Top vertex.
    ctx.lineTo(x - size, y + size);  // Bottom left vertex.
    ctx.lineTo(x + size, y + size);  // Bottom right vertex.
    ctx.closePath();
    ctx.fill();
}

// Update game objects based on elapsed time.
function update(deltaTime) {
    if (gameState === "countdown") {
        countdownTime -= deltaTime / 1000;
        if (countdownTime <= 0) {
            gameState = "playing";
            createPlayer();
            createOpponents();
            countdownTime = 2;
        }
    } else if (gameState === "playing") {
        // Update the football’s position:
        // Move horizontally based on user input and vertically downward automatically.
        player.x += playerDirection * player.speed;
        player.y += player.speed;
        // Keep the player within horizontal bounds.
        player.x = Math.max(0, Math.min(canvas.width, player.x));
        
        // Update opponents: move upward with more erratic horizontal movement.
        for (let i = 0; i < opponents.length; i++) {
            opponents[i].y -= opponents[i].speed; // Move upward.
            opponents[i].x += (Math.random() - 0.5) * 4; // Erratic horizontal movement.
        }
        
        // Check if the football has reached the finish line.
        if (player.y > finishLine.y) {
            // Wave completed: increment wave, then reset finish line and objects.
            wave++;
            createFinishLine();    // Always place finish line at canvas.height - 30.
            createPlayer();        // Reset the football to the top.
            createOpponents();     // Generate a new set of opponents.
            gameState = "countdown";
            countdownTime = 2;
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
    
    // Draw "Cool AF" in the top left in blue using Impact.
    ctx.fillStyle = "blue";
    ctx.font = "30px Impact";
    ctx.textAlign = "left";
    ctx.fillText("Cool AF", 20, 40);
    
    // Draw the wave counter in the top right.
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Wave: ${wave}`, canvas.width - 20, 40);
    ctx.textAlign = "start";
    
    if (gameState === "countdown") {
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText(`Starting in ${Math.ceil(countdownTime)}`, canvas.width / 2 - 150, canvas.height / 2);
    } else if (gameState === "playing") {
        // Draw the football as an oval (ellipse) with a hazel color.
        ctx.fillStyle = "#8E7618";
        ctx.beginPath();
        // The football's horizontal radius is player.radius, vertical radius is 1.5 times that.
        ctx.ellipse(player.x, player.y, player.radius, player.radius * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the finish line.
        ctx.fillStyle = "white";
        ctx.fillRect(0, finishLine.y, finishLine.width, finishLine.height);
        
        // Draw each opponent as an upward-pointing triangle (twice the base size)
        // using the current opponentsColor.
        ctx.fillStyle = opponentsColor;
        for (let i = 0; i < opponents.length; i++) {
            drawTriangle(opponents[i].x, opponents[i].y, opponents[i].radius * 2);
        }
        
        // Optionally, draw a vertical axis line through the football.
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(player.x, 0);
        ctx.lineTo(player.x, canvas.height);
        ctx.stroke();
    }
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
    e.preventDefault(); // Prevent default touch behaviors.
    
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
