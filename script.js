const leds = document.querySelectorAll('.animate-slide-up, .animate-slide-in, .animate-fade-in');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('opacity-100');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

leds.forEach(el => {
  el.classList.add('opacity-0');
  obs.observe(el);
});
// === Elements ===
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('status-message');
const resetBtn = document.getElementById('reset-button');
const undoBtn = document.getElementById('undo-button');
const mode2PlayerBtn = document.getElementById('mode-2player');
const modeCpuBtn = document.getElementById('mode-cpu');

const xWinsCount = document.getElementById('x-wins-count');
const oWinsCount = document.getElementById('o-wins-count');
const drawsCount = document.getElementById('draws-count');

const themeLight = document.getElementById('theme-light');
const themeDark = document.getElementById('theme-dark');
const themeNeon = document.getElementById('theme-neon');

// === Sounds ===
const clickSound = document.getElementById('click-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');

// === Game State ===
let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;
let isCpuMode = false;
let moveHistory = [];
let stats = { X: 0, O: 0, Draw: 0 };

const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// === Init ===
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.textContent = '';
        cell.className = 'cell';
    });
    updateStatus();
    undoBtn.classList.add('hidden');
}
init();

// === Handlers ===
function handleCellClick(e) {
    const cellIndex = e.target.dataset.cellIndex;
    if (!gameActive || board[cellIndex]) return;

    makeMove(cellIndex, currentPlayer);
    if (isCpuMode && gameActive && currentPlayer === 'O') {
        setTimeout(cpuMove, 400);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase(), 'last-move');

    clickSound.currentTime = 0;
    clickSound.play();

    moveHistory.push({ index, player });

    if (checkWin(player)) {
        endGame(false, player);
    } else if (board.every(cell => cell)) {
        endGame(true);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
        undoBtn.classList.remove('hidden');
    }
}

function cpuMove() {
    let available = board
        .map((val, idx) => val ? null : idx)
        .filter(v => v !== null);
    let move = available[Math.floor(Math.random() * available.length)];
    makeMove(move, 'O');
}

// === Win / Draw Detection ===
function checkWin(player) {
    return WIN_COMBOS.some(combo => {
        if (combo.every(index => board[index] === player)) {
            combo.forEach(index => cells[index].classList.add('win'));
            return true;
        }
        return false;
    });
}

function endGame(draw, winner = null) {
    gameActive = false;
    if (draw) {
        statusMessage.textContent = "It's a Draw!";
        stats.Draw++;
        drawsCount.textContent = stats.Draw;
        drawSound.play();
    } else {
        statusMessage.textContent = `${winner} Wins! 🎉`;
        stats[winner]++;
        if (winner === 'X') xWinsCount.textContent = stats.X;
        if (winner === 'O') oWinsCount.textContent = stats.O;
        winSound.play();
    }
    undoBtn.classList.add('hidden');
}

// === Status Update ===
function updateStatus() {
    statusMessage.textContent = `Player ${currentPlayer}'s Turn`;
}

// === Undo ===
undoBtn.addEventListener('click', () => {
    if (!moveHistory.length) return;
    const lastMove = moveHistory.pop();
    board[lastMove.index] = null;
    cells[lastMove.index].textContent = '';
    cells[lastMove.index].className = 'cell';
    currentPlayer = lastMove.player;
    gameActive = true;
    updateStatus();
    if (!moveHistory.length) undoBtn.classList.add('hidden');
});

// === Reset ===
resetBtn.addEventListener('click', () => {
    board.fill(null);
    moveHistory = [];
    gameActive = true;
    currentPlayer = 'X';
    cells.forEach(cell => cell.textContent = '');
    cells.forEach(cell => cell.className = 'cell');
    updateStatus();
    undoBtn.classList.add('hidden');
});

// === Mode Switching ===
mode2PlayerBtn.addEventListener('click', () => {
    isCpuMode = false;
    mode2PlayerBtn.classList.add('active');
    modeCpuBtn.classList.remove('active');
    resetBtn.click();
});
modeCpuBtn.addEventListener('click', () => {
    isCpuMode = true;
    modeCpuBtn.classList.add('active');
    mode2PlayerBtn.classList.remove('active');
    resetBtn.click();
});

// === Theme Switching ===
function setTheme(theme) {
    document.body.className = theme;
    themeLight.classList.remove('active');
    themeDark.classList.remove('active');
    themeNeon.classList.remove('active');
    if (theme === 'light') themeLight.classList.add('active');
    if (theme === 'dark') themeDark.classList.add('active');
    if (theme === 'neon') themeNeon.classList.add('active');
}

themeLight.addEventListener('click', () => setTheme('light'));
themeDark.addEventListener('click', () => setTheme('dark'));
themeNeon.addEventListener('click', () => setTheme('neon'));

// default theme
setTheme('light');
