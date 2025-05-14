class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 6;
        this.height = 20;
        this.speed = 0.8;
        this.color = '#00ff00';
        this.glowSize = 10;
        this.trail = [];
        this.maxTrailLength = 5;
    }
    
    update(deltaTime) {
        // Add current position to trail
        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        this.y -= this.speed * deltaTime;
    }
    
    render(ctx) {
        // Draw laser trail
        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (1 - i / this.trail.length) * 0.3;
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.width, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw laser glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.glowSize
        );
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw laser core
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw vertical laser beam
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(
            this.x - this.width / 4,
            this.y - this.height,
            this.width / 2,
            this.height * 2
        );
        ctx.restore();
    }
    
    checkCollision(bird) {
        const bulletBounds = {
            left: this.x - this.width,
            right: this.x + this.width,
            top: this.y - this.height,
            bottom: this.y + this.height
        };
        
        const birdBounds = bird.getBounds();
        
        return !(
            bulletBounds.left > birdBounds.right ||
            bulletBounds.right < birdBounds.left ||
            bulletBounds.top > birdBounds.bottom ||
            bulletBounds.bottom < birdBounds.top
        );
    }
} 