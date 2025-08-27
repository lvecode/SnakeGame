// 获取画布和上下文
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// 游戏参数
const gridSize = 20; // 网格大小
const tileCount = canvas.width / gridSize; // 网格数量
let speed = 7; // 游戏速度
let initialSpeed = 7; // 初始速度值

// 蛇的初始位置和速度
let snake = [
    { x: 10, y: 10 } // 蛇头的初始位置
];
let velocityX = 0;
let velocityY = 0;

// 食物的初始位置
let foodX = 5;
let foodY = 5;

// 游戏状态
let gameRunning = false;
let gamePaused = false;
let score = 0;
let gameLoop;

// 获取DOM元素
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

// 设置速度滑块的初始值（如果元素存在）
if (speedSlider && speedValue) {
    speedSlider.value = initialSpeed;
    speedValue.textContent = initialSpeed;
    
    // 速度滑块事件监听
    speedSlider.addEventListener('input', function() {
        speed = parseInt(this.value);
        speedValue.textContent = speed;
        
        // 如果游戏正在运行，更新游戏速度
        if (gameRunning && !gamePaused) {
            clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, 1000 / speed);
}
    });
}

// 按钮事件监听
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);

// 键盘事件监听
document.addEventListener('keydown', changeDirection);

// 开始游戏
function startGame() {
    // 如果游戏正在运行，先清除当前游戏状态
    if (gameRunning) {
        clearInterval(gameLoop);
    }
    
    // 重置游戏状态
    snake = [{ x: 10, y: 10 }];
    velocityX = 1;
    velocityY = 0;
    score = 0;
    scoreElement.textContent = score;
    placeFood();
    
    gameRunning = true;
    gamePaused = false;
    startButton.textContent = '重新开始';
    
    // 开始新的游戏循环
    gameLoop = setInterval(gameUpdate, 1000 / speed);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? '继续' : '暂停';
    
    if (gamePaused) {
        clearInterval(gameLoop);
    } else {
        gameLoop = setInterval(gameUpdate, 1000 / speed);
    }
}

// 游戏更新函数
function gameUpdate() {
    // 移动蛇
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === foodX && head.y === foodY) {
        score++;
        scoreElement.textContent = score;
        placeFood();
        
        // 注释掉自动增加速度的功能，因为现在由用户控制
        /*
        if (score % 5 === 0) {
            speed += 1;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameUpdate, 1000 / speed);
        }
        */
    } else {
        // 如果没吃到食物，移除蛇尾
        snake.pop();
    }

    // 检查游戏是否结束
    if (isGameOver()) {
        gameRunning = false;
        clearInterval(gameLoop);
        drawGame(); // 最后一次绘制，显示碰撞状态
        alert(`游戏结束！你的得分是: ${score}`);
        startButton.textContent = '开始游戏';
        return;
    }
    
    // 绘制游戏
    drawGame();
}

// 检查游戏是否结束
function isGameOver() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 改变蛇的方向
function changeDirection(event) {
    // 防止反方向移动
    if (event.key === 'ArrowUp' && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (event.key === 'ArrowDown' && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (event.key === 'ArrowLeft' && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (event.key === 'ArrowRight' && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

// 随机放置食物
function placeFood() {
    // 生成随机位置
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);
    
    // 确保食物不会出现在蛇身上
    for (let segment of snake) {
        if (segment.x === foodX && segment.y === foodY) {
            placeFood(); // 递归调用，重新放置食物
            return;
        }
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
    
    // 绘制蛇
    for (let i = 0; i < snake.length; i++) {
        // 蛇头为绿色，蛇身为浅绿色
        ctx.fillStyle = i === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        
        // 绘制蛇身边框
        ctx.strokeStyle = '#222';
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }
    
    // 绘制网格线（可选）
    drawGrid();
}

// 绘制网格线
function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= tileCount; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// 初始绘制
drawGame();