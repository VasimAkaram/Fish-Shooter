class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score-value');
        this.timerElement = document.getElementById('timer-value');
        this.gameOverScreen = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.shootButton = document.getElementById('shoot-button');
        
        // Set canvas size and handle resize
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });
        
        // Game state
        this.score = 0;
        this.creatures = [];
        this.bullets = [];
        this.lastCreatureSpawn = 0;
        this.creatureSpawnInterval = 1500;
        this.gameTime = 120000; // 2 minutes in milliseconds
        this.startTime = Date.now();
        this.isPaused = false;
        this.isGameOver = false;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Touch handling
        this.touchX = null;
        this.isShooting = false;
        this.autoShootInterval = null;
        
        // Initialize gun
        this.gun = new Gun(this.canvas.width / 2, this.canvas.height - 60);
        
        // Bind event listeners
        this.bindEvents();
        
        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Maintain aspect ratio
        const aspectRatio = 4/3;
        let width = containerWidth;
        let height = containerWidth / aspectRatio;
        
        if (height > containerHeight) {
            height = containerHeight;
            width = height * aspectRatio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Update gun position after resize
        if (this.gun) {
            this.gun.setPosition(width / 2);
        }
    }
    
    bindEvents() {
        if (this.isMobile) {
            // Touch movement
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                this.touchX = (touch.clientX - rect.left) * scaleX;
                this.gun.setPosition(this.touchX);
            });
            
            // Shoot button handling
            this.shootButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isShooting = true;
                this.startAutoShooting();
            });
            
            this.shootButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.isShooting = false;
                this.stopAutoShooting();
            });
            
            // Handle touch end outside button
            document.addEventListener('touchend', () => {
                this.isShooting = false;
                this.stopAutoShooting();
            });
        } else {
            // Mouse movement with throttling
            let lastMove = 0;
            const moveThrottle = 16; // ~60fps
            
            this.canvas.addEventListener('mousemove', (e) => {
                const now = Date.now();
                if (now - lastMove >= moveThrottle) {
                    const rect = this.canvas.getBoundingClientRect();
                    const scaleX = this.canvas.width / rect.width;
                    const gameX = (e.clientX - rect.left) * scaleX;
                    this.gun.setPosition(gameX);
                    lastMove = now;
                }
            });
            
            // Mouse shooting
            this.canvas.addEventListener('mousedown', () => {
                this.isShooting = true;
                this.startAutoShooting();
            });
            
            document.addEventListener('mouseup', () => {
                this.isShooting = false;
                this.stopAutoShooting();
            });
        }
        
        // Restart game
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Pause handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isPaused = true;
                this.stopAutoShooting();
            } else {
                this.isPaused = false;
                this.lastTime = performance.now();
                if (this.isShooting) {
                    this.startAutoShooting();
                }
            }
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            this.isPaused = true;
            setTimeout(() => {
                this.isPaused = false;
                this.lastTime = performance.now();
            }, 500);
        });
    }
    
    startAutoShooting() {
        if (!this.isGameOver) {
            this.gun.shoot(this.bullets);
            this.autoShootInterval = setInterval(() => {
                if (!this.isPaused && !this.isGameOver) {
                    this.gun.shoot(this.bullets);
                }
            }, 200);
        }
    }
    
    stopAutoShooting() {
        if (this.autoShootInterval) {
            clearInterval(this.autoShootInterval);
            this.autoShootInterval = null;
        }
    }
    
    spawnCreature() {
        const types = ['fish', 'jellyfish', 'turtle', 'shark', 'snake'];
        const type = types[Math.floor(Math.random() * types.length)];
        const direction = Math.random() < 0.5 ? 'left' : 'right';
        const y = Math.random() * (this.canvas.height - 200) + 50;
        
        const creature = new Creature(
            direction === 'left' ? this.canvas.width : 0,
            y,
            type,
            direction
        );
        this.creatures.push(creature);
    }
    
    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.creatures.length - 1; j >= 0; j--) {
                const creature = this.creatures[j];
                if (bullet.checkCollision(creature)) {
                    this.score += creature.getPoints();
                    this.scoreElement.textContent = this.score;
                    this.creatures.splice(j, 1);
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    updateTimer() {
        const timeLeft = Math.max(0, this.gameTime - (Date.now() - this.startTime));
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft === 0 && !this.isGameOver) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.stopAutoShooting();
        this.gameOverScreen.style.display = 'block';
        this.finalScoreElement.textContent = this.score;
    }
    
    restartGame() {
        this.score = 0;
        this.creatures = [];
        this.bullets = [];
        this.startTime = Date.now();
        this.isGameOver = false;
        this.gameOverScreen.style.display = 'none';
        this.scoreElement.textContent = '0';
        this.creatureSpawnInterval = 1500;
        this.stopAutoShooting();
        if (this.isShooting) {
            this.startAutoShooting();
        }
    }
    
    update(deltaTime) {
        if (this.isPaused || this.isGameOver) return;
        
        this.updateTimer();
        
        if (Date.now() - this.lastCreatureSpawn > this.creatureSpawnInterval) {
            this.spawnCreature();
            this.lastCreatureSpawn = Date.now();
            this.creatureSpawnInterval = Math.max(800, this.creatureSpawnInterval - 10);
        }
        
        this.gun.update(deltaTime);
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(deltaTime);
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
            }
        }
        
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            this.creatures[i].update(deltaTime);
            const creature = this.creatures[i];
            if ((creature.direction === 'right' && creature.x > this.canvas.width + 100) ||
                (creature.direction === 'left' && creature.x < -100)) {
                this.creatures.splice(i, 1);
            }
        }
        
        this.checkCollisions();
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.creatures.forEach(creature => creature.render(this.ctx));
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.gun.render(this.ctx);
    }
    
    gameLoop(timestamp) {
        if (this.isPaused) {
            this.lastTime = timestamp;
        }
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    new Game();
}); 