class Bird {
    constructor(x, y, type, direction) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.direction = direction;
        
        // Set bird properties based on type
        switch(type) {
            case 'small':
                this.width = 30;
                this.height = 20;
                this.speed = 0.4;
                this.points = 100;
                this.color = '#ff3333';
                this.glowColor = 'rgba(255, 51, 51, 0.3)';
                break;
            case 'medium':
                this.width = 40;
                this.height = 30;
                this.speed = 0.3;
                this.points = 50;
                this.color = '#33ff33';
                this.glowColor = 'rgba(51, 255, 51, 0.3)';
                break;
            case 'large':
                this.width = 50;
                this.height = 40;
                this.speed = 0.2;
                this.points = 25;
                this.color = '#3333ff';
                this.glowColor = 'rgba(51, 51, 255, 0.3)';
                break;
        }
        
        // Animation properties
        this.wingOffset = 0;
        this.wingDirection = 1;
        this.wingSpeed = 0.15;
        this.verticalOffset = 0;
        this.verticalSpeed = 0.05;
        this.rotation = 0;
    }
    
    update(deltaTime) {
        // Move bird
        if (this.direction === 'right') {
            this.x += this.speed * deltaTime;
        } else {
            this.x -= this.speed * deltaTime;
        }
        
        // Animate wings
        this.wingOffset += this.wingSpeed * this.wingDirection * deltaTime;
        if (Math.abs(this.wingOffset) > 15) {
            this.wingDirection *= -1;
        }
        
        // Add floating motion
        this.verticalOffset = Math.sin(Date.now() * this.verticalSpeed) * 5;
        
        // Update rotation for smooth banking
        const targetRotation = this.wingOffset * 0.02;
        this.rotation += (targetRotation - this.rotation) * 0.1;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.verticalOffset);
        ctx.rotate(this.rotation);
        
        // Draw glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
        gradient.addColorStop(0, this.glowColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width, this.height, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw wings with gradient
        const wingGradient = ctx.createLinearGradient(0, -this.height, 0, this.height);
        wingGradient.addColorStop(0, this.color);
        wingGradient.addColorStop(1, this.glowColor);
        ctx.fillStyle = wingGradient;
        
        // Left wing
        ctx.beginPath();
        ctx.moveTo(-this.width / 4, 0);
        ctx.quadraticCurveTo(
            -this.width,
            this.wingOffset,
            -this.width / 2,
            this.height / 2
        );
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(this.width / 4, 0);
        ctx.quadraticCurveTo(
            this.width,
            this.wingOffset,
            this.width / 2,
            this.height / 2
        );
        ctx.fill();
        
        // Draw head
        const headX = this.direction === 'right' ? this.width / 3 : -this.width / 3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(headX, -this.height / 4, this.height / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(
            headX + (this.direction === 'right' ? 2 : -2),
            -this.height / 4,
            2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
    
    getPoints() {
        return this.points;
    }
    
    // Collision detection
    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }
} 

//good work no need to change this
