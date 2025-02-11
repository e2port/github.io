class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0; // For proof of work
    }

    // Calculate the hash of the block
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    // Mine the block (proof of work)
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4; // Set mining difficulty (e.g., '0000')
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    // Create the genesis block
    createGenesisBlock() {
        return new Block(0, "2025-01-01", "Genesis Block", "0");
    }

    // Get the latest block
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Add a block to the chain
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    // Display the blockchain
    displayBlockchain() {
        let blockchainDiv = document.getElementById('blockchain');
        blockchainDiv.innerHTML = ''; // Clear current blockchain
        this.chain.forEach(block => {
            const blockDiv = document.createElement('div');
            blockDiv.classList.add('block');
            blockDiv.innerHTML = `
                <div class="block-content">Index: ${block.index}</div>
                <div class="block-content">Timestamp: ${block.timestamp}</div>
                <div class="block-content">Data: ${block.data}</div>
                <div class="block-content">Hash: ${block.hash}</div>
                <div class="block-content">Previous Hash: ${block.previousHash}</div>
            `;
            blockchainDiv.appendChild(blockDiv);

            if (block !== this.chain[this.chain.length - 1]) {
                const arrow = document.createElement('div');
                arrow.classList.add('block-arrow');
                arrow.textContent = '↓';
                blockchainDiv.appendChild(arrow);
            }
        });
    }
}

// Simple SHA-256 implementation (you can also use an external library like CryptoJS)
function SHA256(message) {
    const sha256 = new TextEncoder();
    return crypto.subtle.digest('SHA-256', sha256.encode(message));
}

// Initialize blockchain
let myBlockchain = new Blockchain();

// Add a block on button click
function addBlock() {
    const blockData = `Transaction at ${new Date().toLocaleTimeString()}`;
    const newBlock = new Block(myBlockchain.chain.length, Date.now(), blockData);
    myBlockchain.addBlock(newBlock);
    myBlockchain.displayBlockchain();
}

// Initialize with the genesis block
myBlockchain.displayBlockchain();
