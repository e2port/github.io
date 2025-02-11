// Matrix Code Effect
const matrixContainer = document.getElementById('matrix');
const matrixColumns = 50; // Number of columns for matrix effect
const matrixRows = 40; // Number of rows for matrix effect

// Generate matrix symbols
for (let i = 0; i < matrixColumns; i++) {
    for (let j = 0; j < matrixRows; j++) {
        const symbol = document.createElement('div');
        symbol.classList.add('matrix-symbol');
        symbol.style.left = `${i * 20}px`;
        symbol.style.top = `${j * 30}px`;
        symbol.textContent = String.fromCharCode(Math.random() * (126 - 33) + 33);
        matrixContainer.appendChild(symbol);
    }
}

// Blockchain animation
const blocks = document.querySelectorAll('.block');

// Set up animation for the blocks and arrows
blocks.forEach((block, index) => {
    block.style.animation = `blockFadeIn 1s ease forwards ${index * 1.5}s`; // Delayed block fade-in
});

// Add arrows that animate the transition between blocks
const arrows = document.querySelectorAll('.block-arrow');
arrows.forEach((arrow, index) => {
    arrow.style.animation = `arrowFadeIn 1s ease forwards ${index * 1.5 + 1}s`; // Delayed arrow fade-in
});

// Keyframes for animations
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes blockFadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
    @keyframes arrowFadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
`, styleSheet.cssRules.length);
