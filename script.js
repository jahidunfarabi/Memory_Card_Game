// Game Variables
let gameStarted = false;
let timerInterval;
let seconds = 0;
let minutes = 0;
let moves = 0;
let score = 0;
let matchedPairs = 0;
let totalPairs = 8; // Easy mode has 8 pairs
let flippedCards = [];
let canFlip = true;
let difficulty = 'easy';

// Animal emojis for cards
const animals = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'
];

// DOM Elements
const timerElement = document.getElementById('timer');
const movesElement = document.getElementById('moves');
const scoreElement = document.getElementById('score');
const pairsElement = document.getElementById('pairs');
const gameBoard = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const diffButtons = document.querySelectorAll('.diff-btn');
const winMessage = document.getElementById('winMessage');
const finalTime = document.getElementById('finalTime');
const finalMoves = document.getElementById('finalMoves');
const finalScore = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');

// Initialize the game
function initGame() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Create cards based on difficulty
    createCards();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update display
    updateDisplay();
}

// Set up event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    hintBtn.addEventListener('click', giveHint);
    playAgainBtn.addEventListener('click', resetGame);
    
    // Difficulty buttons
    diffButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            diffButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set difficulty
            difficulty = this.getAttribute('data-difficulty');
            
            // Update total pairs based on difficulty
            if (difficulty === 'easy') {
                totalPairs = 8;
                gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
            } else if (difficulty === 'medium') {
                totalPairs = 18;
                gameBoard.style.gridTemplateColumns = 'repeat(6, 1fr)';
            } else if (difficulty === 'hard') {
                totalPairs = 32;
                gameBoard.style.gridTemplateColumns = 'repeat(8, 1fr)';
            }
            
            // Reset and create new cards
            resetGame();
        });
    });
}

// Create cards for the game
function createCards() {
    // Clear the game board
    gameBoard.innerHTML = '';
    
    // Get animals for current difficulty
    let selectedAnimals = [];
    
    if (difficulty === 'easy') {
        selectedAnimals = animals.slice(0, 8);
    } else if (difficulty === 'medium') {
        selectedAnimals = animals.slice(0, 12).concat(animals.slice(0, 6));
    } else if (difficulty === 'hard') {
        selectedAnimals = animals.concat(animals);
    }
    
    // Duplicate animals to create pairs
    let cardAnimals = [...selectedAnimals, ...selectedAnimals];
    
    // Shuffle the cards
    cardAnimals = shuffleArray(cardAnimals);
    
    // Create card elements
    cardAnimals.forEach((animal, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.animal = animal;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-back">
                <i class="fas fa-question"></i>
            </div>
            <div class="card-front">
                ${animal}
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
    });
    
    // Update pairs display
    pairsElement.textContent = `0/${totalPairs}`;
}

// Shuffle array function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start the game
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    startBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Game Started';
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
}

// Update the timer
function updateTimer() {
    seconds++;
    
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    
    // Update timer display
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Flip a card
function flipCard(card) {
    // Check if we can flip cards
    if (!canFlip || !gameStarted) return;
    
    // Check if card is already flipped or matched
    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }
    
    // Flip the card
    card.classList.add('flipped');
    flippedCards.push(card);
    
    // If two cards are flipped, check for a match
    if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        movesElement.textContent = moves;
        
        // Check if cards match
        const card1 = flippedCards[0];
        const card2 = flippedCards[1];
        
        if (card1.dataset.animal === card2.dataset.animal) {
            // Cards match
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            
            // Update score (faster matches give more points)
            let points = 100;
            if (seconds < 30) points += 50;
            if (moves < totalPairs * 2) points += 50;
            
            score += points;
            scoreElement.textContent = score;
            
            // Update pairs display
            pairsElement.textContent = `${matchedPairs}/${totalPairs}`;
            
            // Check if game is complete
            if (matchedPairs === totalPairs) {
                endGame();
            }
            
            // Reset flipped cards
            flippedCards = [];
            canFlip = true;
        } else {
            // Cards don't match, flip them back after a delay
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }
}

// Give a hint to the player
function giveHint() {
    if (!gameStarted || flippedCards.length > 0) return;
    
    // Find all unmatched cards
    const unmatchedCards = Array.from(document.querySelectorAll('.card:not(.matched)'));
    
    if (unmatchedCards.length < 2) return;
    
    // Flip two random unmatched cards for a second
    const card1 = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
    let card2;
    
    do {
        card2 = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
    } while (card1 === card2 || card1.dataset.animal !== card2.dataset.animal);
    
    // Flip the hint cards
    card1.classList.add('flipped');
    card2.classList.add('flipped');
    
    // Flip them back after 1 second
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }, 1000);
    
    // Deduct points for using hint
    score = Math.max(0, score - 50);
    scoreElement.textContent = score;
}

// Update the display
function updateDisplay() {
    movesElement.textContent = moves;
    scoreElement.textContent = score;
    pairsElement.textContent = `${matchedPairs}/${totalPairs}`;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// End the game
function endGame() {
    // Stop the timer
    clearInterval(timerInterval);
    
    // Update final stats
    finalTime.textContent = timerElement.textContent;
    finalMoves.textContent = moves;
    finalScore.textContent = score;
    
    // Show win message after a short delay
    setTimeout(() => {
        winMessage.style.display = 'flex';
    }, 1000);
}

// Reset the game
function resetGame() {
    // Reset game variables
    gameStarted = false;
    clearInterval(timerInterval);
    seconds = 0;
    minutes = 0;
    moves = 0;
    score = 0;
    matchedPairs = 0;
    flippedCards = [];
    canFlip = true;
    
    // Reset UI
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
    winMessage.style.display = 'none';
    
    // Create new cards
    createCards();
    
    // Update display
    updateDisplay();
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);