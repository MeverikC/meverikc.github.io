let GRID_SIZE = 4;
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

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let grid = [];



function initGrid() {
    const canvasSize = GRID_SIZE * (TILE_SIZE + TILE_MARGIN) + TILE_MARGIN;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    // 创建一个二维数组表示游戏网格，并用0填充，代表空白。
    grid = Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(0));
    // 调用addNewTile()两次以在网格中随机添加两个新方块。
    addNewTile();
    addNewTile();
}

function addNewTile() {
    // 寻找空位并放置新方块
    const emptyTiles = [];
    // 若为空的则把该位置放入emptyTiles
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) emptyTiles.push([r, c]);
        }
    }
    // 当以上执行完且emptyTiles不为空时给当前砖块赋值, 随机赋值为2/4
    if (emptyTiles.length > 0) {
        const [r, c] = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function drawGrid() {
    // ...清除画布并重绘所有方块...
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#bbada0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            // 获取当前循环砖块的值
            const value = grid[r][c];
            // 获取当前砖块位置=>竖向位置*(砖块尺寸+砖块间距) + 砖块间距
            const x = c * (TILE_SIZE + TILE_MARGIN) + TILE_MARGIN;
            // 获取当前砖块位置=>横向位置*(砖块尺寸+砖块间距) + 砖块间距
            const y = r * (TILE_SIZE + TILE_MARGIN) + TILE_MARGIN;
            // 更具value获取砖块背景颜色
            ctx.fillStyle = TILE_COLORS[value] || TILE_COLORS[2048];
            // 重绘当前坐标砖块 x坐标 y坐标 砖块宽度 砖块高度
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

            if (value > 0) {
                // 如果当前循环项存在砖块:
                // 字体颜色
                ctx.fillStyle = FONT_COLOR;
                // 字体样式
                ctx.font = "bold 40px Arial";
                // 字体布局
                ctx.textAlign = "center";
                // 文本基线
                ctx.textBaseline = "middle";
                // 画出文本 参数:str x坐标, y坐标
                ctx.fillText(value, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
            }
        }
    }
}

function move(direction) {
    // 根据方向移动并合并方块
    let moved = false;

    function merge(row) {
        // 通过 filter 方法从 row 中筛选出所有不为零的方块，得到一个新数组 nonZero
        const nonZero = row.filter(x => x !== 0);
        const merged = [];
        let skip = false;
        // 遍历 nonZero 数组中的每个元素
        for (let i = 0; i < nonZero.length; i++) {
            if (skip) {
                skip = false;
                continue;
            }
            // 检查当前元素是否与下一个元素相等，并且当前元素不是最后一个
            if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
                // 当前元素的值乘以2，加入到 merged 数组中
                merged.push(nonZero[i] * 2);
                skip = true;
            } else {
                // 如果当前元素不等于下一个元素，则将当前元素直接加入到 merged 数组中
                merged.push(nonZero[i]);
            }
        }

        // 确保 merged 数组的长度等于 GRID_SIZE，如果不够，则用 0 补齐
        while (merged.length < GRID_SIZE) merged.push(0);
        return merged;
    }

    // 循环行
    for (let i = 0; i < GRID_SIZE; i++) {
        // 初始化一个变量 row，用于存储当前处理的行或列
        let row;
        // 获取第 i 列的数据，赋值给 row；否则，直接获取第 i 行的数据
        if (direction === "UP" || direction === "DOWN") {
            row = grid.map(row => row[i]);
        } else {
            row = grid[i];
        }

        // 如果移动的方向是 "DOWN" 或 "RIGHT"，则将 row 数组反转，以便从适当的方向处理合并
        if (direction === "DOWN" || direction === "RIGHT") row.reverse();

        // 调用 merge 函数，将 row 作为参数传入，并将合并后的结果赋值给 newRow
        const newRow = merge(row);

        // 如果方向是 "DOWN" 或 "RIGHT"，则将 newRow 再次反转，以保持正确的顺序
        if (direction === "DOWN" || direction === "RIGHT") newRow.reverse();

        // 遍历 GRID_SIZE 的每个单元
        for (let j = 0; j < GRID_SIZE; j++) {
            // 如果用户操作的方向是 "UP" 或 "DOWN"
            if (direction === "UP" || direction === "DOWN") {
                // 检查原始网格中的方块与合并后的新数组 newRow 相比是否有不同，若不同则设 moved 为 true
                if (grid[j][i] !== newRow[j]) moved = true;
                grid[j][i] = newRow[j];
            } else { // 更新原始网格中的方块值为合并后数组的对应值
                // 如果方向是 "LEFT" 或 "RIGHT"，则进行相似的操作，检查并更新网格
                if (grid[i][j] !== newRow[j]) moved = true;
                grid[i][j] = newRow[j];
            }
        }
    }

    if (moved) addNewTile();
}

function isGameOver() {
    // ...检查是否有可移动的空间或可合并的方块...
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 0) return false;
            if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
            if (r < GRID_SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
        }
    }
    return true;
}

function handleTouch(event) {
    // ...根据触摸方向触发移动...
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
    // ...根据键盘箭头键触发移动...
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

initGrid();
drawGrid();

// 获取元素
const selectContainer = document.querySelector('.select-container');
const selectedOption = document.querySelector('.selected-option');
const dropdownOptions = document.querySelectorAll('.dropdown-options li');

// 点击事件，展开或收起下拉框
selectedOption.addEventListener('click', () => {
    selectContainer.classList.toggle('active');
});

// 选择下拉项
dropdownOptions.forEach(option => {
    option.addEventListener('click', () => {
        selectedOption.firstChild.textContent = option.textContent; // 更新文本
        GRID_SIZE = parseInt(option.textContent);
        console.log(option.textContent);
        selectContainer.classList.remove('active'); // 收起下拉框
        initGrid(); // 重新初始化网格大小
        drawGrid(); // 重新绘画
    });

});

// 点击其他地方关闭下拉框
document.addEventListener('click', (e) => {
    if (!selectContainer.contains(e.target)) {
        selectContainer.classList.remove('active');
    }
});
