const TILE_SIZE = 100;
const TILE_MARGIN = 10;
const TILE_COLORS = {
    0: "#cdc1b4",
    2: "#eee4da",
    4: "#ede0c8",
    8: "#f2b179",
    16: "#f59563",
    32: "#f67c5f",
    64: "#f65e3b",
    128: "#edcf72",
    256: "#edcc61",
    512: "#edc850",
    1024: "#edc53f",
    2048: "#edc22e"
};
const FONT_COLOR = "#776e65";
let StorageKey = "2048_Game";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameData = {
    grid: [],
    canvasSize: 0,
    GRID_SIZE: 4
};

function initGrid() {
    const canvasSize = gameData.GRID_SIZE * (TILE_SIZE + TILE_MARGIN) + TILE_MARGIN;
    canvas.width = canvas.height = canvasSize;
    gameData.canvasSize = canvasSize;
    gameData.grid = Array.from({ length: gameData.GRID_SIZE }, () => Array(gameData.GRID_SIZE).fill(0));
    addNewTile();
    addNewTile();
}

function addNewTile() {
    const emptyTiles = [];
    for (let r = 0; r < gameData.GRID_SIZE; r++) {
        for (let c = 0; c < gameData.GRID_SIZE; c++) {
            if (gameData.grid[r][c] === 0) emptyTiles.push([r, c]);
        }
    }
    if (emptyTiles.length > 0) {
        const [r, c] = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        gameData.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#bbada0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < gameData.GRID_SIZE; r++) {
        for (let c = 0; c < gameData.GRID_SIZE; c++) {
            const value = gameData.grid[r][c];
            const x = c * (TILE_SIZE + TILE_MARGIN) + TILE_MARGIN;
            const y = r * (TILE_SIZE + TILE_MARGIN) + TILE_MARGIN;
            ctx.fillStyle = TILE_COLORS[value] || TILE_COLORS[2048];
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

            if (value > 0) {
                ctx.fillStyle = FONT_COLOR;
                ctx.font = "bold 40px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(value, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
            }
        }
    }
}

function move(direction) {
    let moved = false;

    function merge(row) {
        const nonZero = row.filter(x => x !== 0);
        const merged = [];
        let skip = false;
        for (let i = 0; i < nonZero.length; i++) {
            if (skip) {
                skip = false;
                continue;
            }
            if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
                merged.push(nonZero[i] * 2);
                skip = true;
            } else {
                merged.push(nonZero[i]);
            }
        }
        while (merged.length < gameData.GRID_SIZE) merged.push(0);
        return merged;
    }

    for (let i = 0; i < gameData.GRID_SIZE; i++) {
        let row;
        if (direction === "UP" || direction === "DOWN") {
            row = gameData.grid.map(row => row[i]);
        } else {
            row = gameData.grid[i];
        }

        if (direction === "DOWN" || direction === "RIGHT") row.reverse();

        const newRow = merge(row);

        if (direction === "DOWN" || direction === "RIGHT") newRow.reverse();

        for (let j = 0; j < gameData.GRID_SIZE; j++) {
            if (direction === "UP" || direction === "DOWN") {
                if (gameData.grid[j][i] !== newRow[j]) moved = true;
                gameData.grid[j][i] = newRow[j];
            } else {
                if (gameData.grid[i][j] !== newRow[j]) moved = true;
                gameData.grid[i][j] = newRow[j];
            }
        }
    }

    if (moved) {
        addNewTile();
        saveGameData(StorageKey, gameData);
    }
}

function isGameOver() {
    for (let r = 0; r < gameData.GRID_SIZE; r++) {
        for (let c = 0; c < gameData.GRID_SIZE; c++) {
            if (gameData.grid[r][c] === 0) return false;
            if (c < gameData.GRID_SIZE - 1 && gameData.grid[r][c] === gameData.grid[r][c + 1]) return false;
            if (r < gameData.GRID_SIZE - 1 && gameData.grid[r][c] === gameData.grid[r + 1][c]) return false;
        }
    }
    return true;
}

function handleTouch(event) {
    const touch = event.changedTouches[0];
    const dx = touch.pageX - touchStartX;
    const dy = touch.pageY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) move("RIGHT");
        else move("LEFT");
    } else {
        if (dy > 0) move("DOWN");
        else move("UP");
    }

    drawGrid();
    if (isGameOver()) alert("Game Over!");
}

let touchStartX, touchStartY;

canvas.addEventListener("touchstart", event => {
    const touch = event.touches[0];
    touchStartX = touch.pageX;
    touchStartY = touch.pageY;
});

canvas.addEventListener("touchend", handleTouch);

window.addEventListener("keydown", event => {
    const keyMap = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT"
    };

    if (keyMap[event.key]) {
        move(keyMap[event.key]);
        drawGrid();
        if (isGameOver()) alert("Game Over!");
    }
});

function saveGameData(StorageKey, data) {
    localStorage.setItem(StorageKey, JSON.stringify(data));
}

function getGameData(StorageKey) {
    const data = localStorage.getItem(StorageKey);
    return data ? JSON.parse(data) : null;
}

// 初始化或加载游戏数据
function loadGameData() {
    const savedData = getGameData(StorageKey);
    if (savedData) {
        gameData = savedData;
        canvas.width = canvas.height = savedData.canvasSize;
    } else {
        initGrid();
    }
    // 确保下拉菜单显示当前的 GRID_SIZE
    selectedOptionText.textContent = `${gameData.GRID_SIZE}`;
    drawGrid();
}

// 下拉选择游戏网格大小
const selectContainer = document.querySelector('.select-container');
const selectedOption = document.querySelector('.selected-option');
const selectedOptionText = document.querySelector('.selected-option-text');
const selectedOptionArrow = document.querySelector('.selected-option-arrow');
const dropdownOptions = document.querySelectorAll('.dropdown-options li');

selectedOptionText.textContent = `${gameData.GRID_SIZE}`; // 初始显示当前GRID_SIZE

selectedOption.addEventListener('click', () => {
    selectContainer.classList.toggle('active');
});

dropdownOptions.forEach(option => {
    option.addEventListener('click', () => {
        gameData.GRID_SIZE = parseInt(option.textContent);
        selectedOptionText.firstChild.textContent = `${gameData.GRID_SIZE}`; // 更新文本
        selectContainer.classList.remove('active'); // 收起下拉框
        initGrid(); // 重新初始化网格大小
        drawGrid(); // 重新绘画
        saveGameData(StorageKey, gameData)
    });
});

document.addEventListener('click', (e) => {
    if (!selectContainer.contains(e.target)) {
        selectContainer.classList.remove('active');
    }
});

// localStorage.clear();  // 清空所有 localStorage 数据
// 启动游戏并加载进度
loadGameData();
