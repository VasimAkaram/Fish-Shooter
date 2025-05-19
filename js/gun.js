class Gun {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        this.baseColor = '#1a1a1a';
        this.accentColor = '#00ff00';
        this.glowColor = 'rgba(0, 255, 0, 0.3)';
        this.energyLevel = 100;
        this.lastShot = 0;
        this.shootingDelay = 200;
        this.recoil = 0;
        this.maxRecoil = 10;
        this.pulseOffset = 0;
        this.chargeParticles = [];
    }

    setPosition(x) {
        this.x = Math.max(this.width / 2, Math.min(x, 800 - this.width / 2));
    }

    shoot(bullets) {
        const now = Date.now();
        if (now - this.lastShot >= this.shootingDelay) {
            bullets.push(new Bullet(this.x, this.y - this.height / 2));
            this.lastShot = now;
            this.recoil = this.maxRecoil;
            this.energyLevel = Math.max(0, this.energyLevel - 5);
            
            // Add charge particles
            for (let i = 0; i < 5; i++) {
                this.chargeParticles.push({
                    x: this.x + (Math.random() - 0.5) * this.width,
                    y: this.y + (Math.random() - 0.5) * this.height,
                    vx: (Math.random() - 0.5) * 5,
                    vy: -Math.random() * 5,
                    life: 1
                });
            }
        }
    }

    update(deltaTime) {
        // Handle recoil animation
        if (this.recoil > 0) {
            this.recoil = Math.max(0, this.recoil - (deltaTime * 0.05));
        }
        
        // Regenerate energy
        this.energyLevel = Math.min(100, this.energyLevel + deltaTime * 0.02);
        
        // Update pulse effect
        this.pulseOffset = Math.sin(Date.now() * 0.003) * 5;
        
        // Update charge particles
        for (let i = this.chargeParticles.length - 1; i >= 0; i--) {
            const particle = this.chargeParticles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime * 0.001;
            
            if (particle.life <= 0) {
                this.chargeParticles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.save();
        
        // Draw energy field
        const fieldGradient = ctx.createRadialGradient(
            this.x, this.y, this.width * 0.3,
            this.x, this.y, this.width
        );
        fieldGradient.addColorStop(0, 'rgba(0, 255, 0, 0.1)');
        fieldGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        ctx.fillStyle = fieldGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
       //good work 
        // Draw charge particles
        this.chargeParticles.forEach(particle => {
            ctx.fillStyle = `rgba(0, 255, 0, ${particle.life})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw gun base with metallic effect
        const baseGradient = ctx.createLinearGradient(
            this.x - this.width / 2,
            this.y,
            this.x + this.width / 2,
            this.y
        );
        baseGradient.addColorStop(0, '#333');
        baseGradient.addColorStop(0.5, this.baseColor);
        baseGradient.addColorStop(1, '#333');
        
        ctx.fillStyle = baseGradient;
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 3, this.y);
        ctx.lineTo(this.x - this.width / 3, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Add metallic highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw energy core
        const coreGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, 15
        );
        coreGradient.addColorStop(0, '#fff');
        coreGradient.addColorStop(0.5, this.accentColor);
        coreGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10 + this.pulseOffset, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw gun barrel with recoil
        const barrelY = this.y - this.height / 2 + this.recoil;
        const barrelGradient = ctx.createLinearGradient(
            this.x - 10,
            barrelY,
            this.x + 10,
            barrelY
        );
        barrelGradient.addColorStop(0, '#222');
        barrelGradient.addColorStop(0.5, '#444');
        barrelGradient.addColorStop(1, '#222');
        
        ctx.fillStyle = barrelGradient;
        ctx.fillRect(
            this.x - 10,
            barrelY,
            20,
            this.height / 2
        );
        
        // Draw energy meter
        const meterWidth = this.width * 0.8;
        const meterHeight = 4;
        const meterX = this.x - meterWidth / 2;
        const meterY = this.y + this.height / 3;
        
        // Meter background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Energy level
        const energyGradient = ctx.createLinearGradient(meterX, 0, meterX + meterWidth, 0);
        energyGradient.addColorStop(0, '#ff0000');
        energyGradient.addColorStop(0.5, '#ffff00');
        energyGradient.addColorStop(1, '#00ff00');
        
        ctx.fillStyle = energyGradient;
        ctx.fillRect(
            meterX,
            meterY,
            meterWidth * (this.energyLevel / 100),
            meterHeight
        );
        
        ctx.restore();
    }
} 
