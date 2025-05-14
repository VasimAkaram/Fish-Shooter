class Creature {
    constructor(x, y, type, direction) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.direction = direction;
        
        // Set creature properties based on type
        switch(type) {
            case 'fish':
                this.width = 40;
                this.height = 25;
                this.speed = 0.3;
                this.points = 50;
                this.color = '#FF6B6B';
                this.glowColor = 'rgba(255, 107, 107, 0.3)';
                break;
            case 'jellyfish':
                this.width = 35;
                this.height = 45;
                this.speed = 0.15;
                this.points = 75;
                this.color = '#BB6BD9';
                this.glowColor = 'rgba(187, 107, 217, 0.3)';
                this.pulseOffset = 0;
                break;
            case 'turtle':
                this.width = 50;
                this.height = 35;
                this.speed = 0.2;
                this.points = 100;
                this.color = '#2ECC71';
                this.glowColor = 'rgba(46, 204, 113, 0.3)';
                break;
            case 'shark':
                this.width = 70;
                this.height = 40;
                this.speed = 0.35;
                this.points = 150;
                this.color = '#7F8C8D';
                this.glowColor = 'rgba(127, 140, 141, 0.3)';
                break;
            case 'snake':
                this.width = 60;
                this.height = 20;
                this.speed = 0.25;
                this.points = 125;
                this.color = '#F1C40F';
                this.glowColor = 'rgba(241, 196, 15, 0.3)';
                this.segments = [];
                for (let i = 0; i < 5; i++) {
                    this.segments.push({ x: x - i * 20, y });
                }
                break;
        }
        
        // Animation properties
        this.offset = 0;
        this.animationSpeed = 0.1;
        this.verticalOffset = 0;
        this.verticalSpeed = 0.05;
    }
    
    update(deltaTime) {
        // Move creature
        const movement = this.speed * deltaTime;
        if (this.direction === 'right') {
            this.x += movement;
        } else {
            this.x -= movement;
        }
        
        // Vertical floating motion
        this.verticalOffset = Math.sin(Date.now() * this.verticalSpeed) * 5;
        
        // Type-specific animations
        switch(this.type) {
            case 'jellyfish':
                this.pulseOffset = Math.sin(Date.now() * 0.003) * 10;
                break;
            case 'snake':
                // Update snake segments
                const headX = this.x;
                const headY = this.y + this.verticalOffset;
                for (let i = 0; i < this.segments.length; i++) {
                    const segment = this.segments[i];
                    const targetX = i === 0 ? headX : this.segments[i - 1].x;
                    const targetY = i === 0 ? headY : this.segments[i - 1].y;
                    const dx = targetX - segment.x;
                    const dy = targetY - segment.y;
                    segment.x += dx * 0.2;
                    segment.y += dy * 0.2;
                }
                break;
        }
        
        this.offset += this.animationSpeed * deltaTime;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + this.verticalOffset);
        
        // Draw glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
        gradient.addColorStop(0, this.glowColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width, this.height, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Render based on creature type
        switch(this.type) {
            case 'fish':
                this.renderFish(ctx);
                break;
            case 'jellyfish':
                this.renderJellyfish(ctx);
                break;
            case 'turtle':
                this.renderTurtle(ctx);
                break;
            case 'shark':
                this.renderShark(ctx);
                break;
            case 'snake':
                this.renderSnake(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    renderFish(ctx) {
        ctx.fillStyle = this.color;
        
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        const tailX = this.direction === 'right' ? -this.width / 2 : this.width / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tailX, -this.height / 2);
        ctx.lineTo(tailX, this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        // Eye
        ctx.fillStyle = '#fff';
        const eyeX = this.direction === 'right' ? this.width / 4 : -this.width / 4;
        ctx.beginPath();
        ctx.arc(eyeX, -this.height / 6, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderJellyfish(ctx) {
        ctx.fillStyle = this.color;
        
        // Bell
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI, false);
        ctx.fill();
        
        // Tentacles
        for (let i = -3; i <= 3; i++) {
            const startX = (i * this.width / 6);
            const waveOffset = Math.sin(this.offset + i) * 5;
            
            ctx.beginPath();
            ctx.moveTo(startX, 0);
            ctx.quadraticCurveTo(
                startX + waveOffset,
                this.height / 2 + this.pulseOffset,
                startX,
                this.height
            );
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
    }
    
    renderTurtle(ctx) {
        ctx.fillStyle = this.color;
        
        // Shell
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        const headX = this.direction === 'right' ? this.width / 3 : -this.width / 3;
        ctx.beginPath();
        ctx.arc(headX, 0, this.height / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Flippers
        const flipperOffset = Math.sin(this.offset) * 10;
        ctx.beginPath();
        ctx.ellipse(-this.width / 4, flipperOffset, this.width / 6, this.height / 4, 0, 0, Math.PI * 2);
        ctx.ellipse(this.width / 4, -flipperOffset, this.width / 6, this.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderShark(ctx) {
        ctx.fillStyle = this.color;
        
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail fin
        const tailX = this.direction === 'right' ? -this.width / 2 : this.width / 2;
        ctx.beginPath();
        ctx.moveTo(tailX, 0);
        ctx.lineTo(tailX + (this.direction === 'right' ? -20 : 20), -this.height);
        ctx.lineTo(tailX + (this.direction === 'right' ? -20 : 20), this.height);
        ctx.closePath();
        ctx.fill();
        
        // Dorsal fin
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(0, -this.height);
        ctx.lineTo(this.direction === 'right' ? this.width / 4 : -this.width / 4, -this.height / 2);
        ctx.closePath();
        ctx.fill();
    }
    
    renderSnake(ctx) {
        ctx.restore();
        
        // Render snake segments
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const segment = this.segments[i];
            const radius = i === 0 ? this.width / 4 : this.width / 6;
            
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Add eyes to head segment
            if (i === 0) {
                ctx.fillStyle = '#fff';
                const eyeOffset = this.direction === 'right' ? radius / 2 : -radius / 2;
                ctx.beginPath();
                ctx.arc(segment.x + eyeOffset, segment.y - radius / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    getPoints() {
        return this.points;
    }
    
    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }
} 