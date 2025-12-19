/**
 * Frosty Dash - Endless Runner Logic
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Game State
        this.gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('frostyDash_highScore')) || 0;
        this.gameSpeed = 5;
        this.maxSpeed = 15;
        this.speedIncrement = 0.001;
        this.gravity = 0.8;
        
        // Game Objects
        this.snowman = null;
        this.obstacles = [];
        this.backgroundLayers = [];
        this.snowflakes = [];
        this.particles = [];
        
        // Spawning
        this.obstacleTimer = 0;
        this.obstacleInterval = 1500;

        // UI Elements
        this.ui = {
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            hud: document.getElementById('game-hud'),
            scoreValue: document.getElementById('score-value'),
            highScoreValue: document.getElementById('high-score-value'),
            finalScore: document.getElementById('final-score'),
            startButton: document.getElementById('start-button'),
            restartButton: document.getElementById('restart-button')
        };

        this.initEventListeners();
        this.initBackground();
        this.initSnowflakes();
        this.updateHUD();

        // Start Loop
        this.lastTime = 0;
        this.animate(0);
    }

    resize() {
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        if (this.snowman) {
            this.snowman.groundY = this.canvas.height - 80;
        }
    }

    initEventListeners() {
        const jumpAction = () => {
            if (this.gameState === 'PLAYING') {
                this.snowman.jump();
            }
        };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                jumpAction();
            }
        });

        this.canvas.addEventListener('mousedown', jumpAction);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            jumpAction();
        });

        this.ui.startButton.addEventListener('click', () => this.startGame());
        this.ui.restartButton.addEventListener('click', () => this.startGame());
    }

    initBackground() {
        // Simple parallax layers
        this.backgroundLayers = [
            { color: '#B2EBF2', speed: 0.1, heights: this.generateMountainPath(0.1) },
            { color: '#81D4FA', speed: 0.3, heights: this.generateMountainPath(0.2) },
            { color: '#4FC3F7', speed: 0.5, heights: this.generateMountainPath(0.3) }
        ];
    }

    generateMountainPath(amplitude) {
        const points = [];
        for (let i = 0; i <= 20; i++) {
            points.push(Math.random() * amplitude);
        }
        return points;
    }

    initSnowflakes() {
        this.snowflakes = [];
        for (let i = 0; i < 100; i++) {
            this.snowflakes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 1 + 0.5,
                wind: Math.random() * 0.5 - 0.25
            });
        }
    }

    startGame() {
        this.gameState = 'PLAYING';
        this.score = 0;
        this.gameSpeed = 5;
        this.obstacles = [];
        this.particles = [];
        this.snowman = new Snowman(this.canvas.height - 80);
        
        this.ui.startScreen.classList.add('hidden');
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.hud.classList.remove('hidden');
    }

    gameOver() {
        this.gameState = 'GAMEOVER';
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('frostyDash_highScore', this.highScore);
        }
        
        this.ui.finalScore.innerText = `${Math.floor(this.score)}m`;
        this.ui.highScoreValue.innerText = `${Math.floor(this.highScore)}m`;
        this.ui.gameOverScreen.classList.remove('hidden');
        this.updateHUD();
    }

    updateHUD() {
        this.ui.scoreValue.innerText = `${Math.floor(this.score)}m`;
        this.ui.highScoreValue.innerText = `${Math.floor(this.highScore)}m`;
    }

    update(deltaTime) {
        if (this.gameState === 'PLAYING') {
            this.score += this.gameSpeed * 0.01 * deltaTime;
            this.gameSpeed = Math.min(this.gameSpeed + this.speedIncrement * deltaTime, this.maxSpeed);
            
            this.snowman.update(this.gravity);
            this.updateObstacles(deltaTime);
            this.updateParticles(deltaTime);
            this.updateHUD();

            // Collision Check
            for (const obstacle of this.obstacles) {
                if (this.checkCollision(this.snowman, obstacle)) {
                    this.createExplosion(this.snowman.x, this.snowman.y);
                    this.gameOver();
                }
            }
        }

        this.updateSnowflakes(deltaTime);
    }

    updateObstacles(deltaTime) {
        this.obstacleTimer += deltaTime;
        if (this.obstacleTimer > this.obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
            // Gradually decrease interval to make it harder
            this.obstacleInterval = Math.max(800, 1500 - (this.gameSpeed * 50));
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.gameSpeed * (deltaTime / 16);
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    spawnObstacle() {
        const types = ['tree', 'rock', 'ice'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.obstacles.push(new Obstacle(this.canvas.width, this.canvas.height - 80, type));
    }

    updateSnowflakes(deltaTime) {
        for (const s of this.snowflakes) {
            s.y += s.speed * (deltaTime / 16);
            s.x += s.wind * (deltaTime / 16);
            if (s.y > this.canvas.height) {
                s.y = -10;
                s.x = Math.random() * this.canvas.width;
            }
        }
    }

    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: '#fff'
            });
        }
    }

    checkCollision(player, obs) {
        // Simple circle-rectangle or AABB collision
        // Snowman is roughly a set of circles, but 40x80 box for simplicity
        const pBox = {
            x: player.x - 20,
            y: player.y - 70,
            w: 40,
            h: 80
        };
        
        const oBox = {
            x: obs.x,
            y: obs.y - obs.height,
            w: obs.width,
            h: obs.height
        };

        return pBox.x < oBox.x + oBox.w &&
               pBox.x + pBox.w > oBox.x &&
               pBox.y < oBox.y + oBox.h &&
               pBox.y + pBox.h > oBox.y;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawGround();
        
        if (this.gameState === 'PLAYING' || this.gameState === 'GAMEOVER') {
            this.snowman.draw(this.ctx);
            for (const obs of this.obstacles) obs.draw(this.ctx);
            this.drawParticles();
        }

        this.drawSnowflakes();
    }

    drawBackground() {
        // Draw distant mountains
        this.backgroundLayers.forEach((layer, idx) => {
            this.ctx.fillStyle = layer.color;
            this.ctx.beginPath();
            const yBase = this.canvas.height * (0.5 + idx * 0.1);
            this.ctx.moveTo(0, this.canvas.height);
            
            const step = this.canvas.width / (layer.heights.length - 1);
            for (let i = 0; i < layer.heights.length; i++) {
                const x = i * step;
                const y = yBase - (layer.heights[i] * this.canvas.height);
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.fill();
        });
    }

    drawGround() {
        const groundHeight = 80;
        const y = this.canvas.height - groundHeight;
        
        // Main snow ground
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, y, this.canvas.width, groundHeight);
        
        // Ground shadow/depth
        this.ctx.fillStyle = '#E0F7FA';
        this.ctx.fillRect(0, y, this.canvas.width, 10);
        
        // Decorative snow mounds
        this.ctx.fillStyle = '#F5F5F5';
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.arc((i * this.canvas.width / 4) + (Math.sin(Date.now() * 0.001 + i) * 20), y + 15, 30, 0, Math.PI, true);
            this.ctx.fill();
        }
    }

    drawSnowflakes() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (const s of this.snowflakes) {
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawParticles() {
        for (const p of this.particles) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    animate(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.animate(t));
    }
}

class Snowman {
    constructor(groundY) {
        this.x = 100;
        this.y = groundY;
        this.groundY = groundY;
        this.vy = 0;
        this.jumpForce = -18;
        this.isJumping = false;
        this.angle = 0;
        this.size = 30; // base ball radius
    }

    jump() {
        if (!this.isJumping) {
            this.vy = this.jumpForce;
            this.isJumping = true;
        }
    }

    update(gravity) {
        this.vy += gravity;
        this.y += this.vy;

        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.vy = 0;
            this.isJumping = false;
        }

        // Slight wobble/roll effect
        this.angle += 0.05;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Squash and stretch effect based on velocity
        let stretch = 1;
        if (this.isJumping) {
            stretch = 1 - Math.min(0.2, Math.abs(this.vy) * 0.01);
        }

        // Bottom Ball
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(0, -25, 35, 30 * stretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // Middle Ball
        ctx.beginPath();
        ctx.ellipse(0, -60, 25, 22 * stretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // Top Ball (Head)
        ctx.beginPath();
        ctx.ellipse(0, -90, 18, 16 * stretch, 0, 0, Math.PI * 2);
        ctx.fill();

        // Face
        // Eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-6, -95, 2.5, 0, Math.PI * 2);
        ctx.arc(6, -95, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Carrot Nose
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.moveTo(0, -90);
        ctx.lineTo(15, -88);
        ctx.lineTo(0, -86);
        ctx.fill();

        // Hat
        ctx.fillStyle = '#37474F';
        ctx.fillRect(-15, -105, 30, 4); // Brim
        ctx.fillRect(-10, -120, 20, 15); // Top

        ctx.restore();
    }
}

class Obstacle {
    constructor(x, groundY, type) {
        this.x = x;
        this.groundY = groundY;
        this.type = type;
        
        if (type === 'tree') {
            this.width = 40;
            this.height = 70;
        } else if (type === 'rock') {
            this.width = 50;
            this.height = 30;
        } else { // ice
            this.width = 60;
            this.height = 15;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.groundY);

        if (this.type === 'tree') {
            // Trunk
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(this.width/2 - 5, -15, 10, 15);
            // Leaves
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(this.width/2, -70);
            ctx.lineTo(this.width, -15);
            ctx.fill();
            // Snow on tree
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(this.width/4, -35);
            ctx.lineTo(this.width/2, -50);
            ctx.lineTo(this.width*0.75, -35);
            ctx.fill();
        } else if (this.type === 'rock') {
            ctx.fillStyle = '#78909C';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(this.width/2, -this.height * 1.5, this.width, 0);
            ctx.fill();
        } else { // ice
            ctx.fillStyle = 'rgba(129, 212, 250, 0.6)';
            ctx.fillRect(0, -this.height, this.width, this.height);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(0, -this.height, this.width, this.height);
        }

        ctx.restore();
    }
}

// Initialize Game
window.onload = () => {
    new Game();
};
