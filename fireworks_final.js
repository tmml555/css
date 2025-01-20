class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 12,  
            y: (Math.random() - 0.5) * 12
        };
        this.alpha = 1;
        this.friction = 0.96;  
        this.gravity = 0.2;   
        this.size = Math.random() * 2 + 1;  
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update(ctx) {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.006;  
        this.draw(ctx);
        return this.alpha > 0;
    }
}

class Firework {
    constructor(canvas, x, y, targetY) {
        this.x = x;
        this.y = y;
        this.targetY = targetY;
        this.ctx = canvas.getContext('2d');
        this.speed = -20;  
        this.particles = [];
        this.hue = Math.random() * 360;  
        this.isExploded = false;
    }

    draw() {
        if (!this.isExploded) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, 1)`;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, 0.8)`;
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    explode() {
        const particleCount = 80;  
        const colors = [
            `hsla(${this.hue}, 100%, 70%, `,          
            `hsla(${this.hue + 30}, 100%, 70%, `,     
            `hsla(${this.hue - 30}, 100%, 70%, `,     
            `hsla(${this.hue + 180}, 100%, 70%, `,    
            'hsla(60, 100%, 80%, '                    
        ];

        for (let i = 0; i < particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)] + '1)';
            this.particles.push(new Particle(this.x, this.y, color));
        }
        this.isExploded = true;
    }

    update() {
        if (!this.isExploded) {
            this.y += this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
            this.draw();
            return true;
        } else {
            this.particles = this.particles.filter(particle => particle.update(this.ctx));
            return this.particles.length > 0;
        }
    }
}

class FireworksDisplay {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.isRunning = false;
        this.lastUpdate = 0;
        this.updateInterval = 1000 / 90;  

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    createFirework() {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height;
        const targetY = this.canvas.height * 0.1 + Math.random() * (this.canvas.height * 0.25);
        this.fireworks.push(new Firework(this.canvas, x, y, targetY));
    }

    animate(timestamp) {
        if (!this.isRunning) return;

        if (timestamp - this.lastUpdate < this.updateInterval) {
            requestAnimationFrame((ts) => this.animate(ts));
            return;
        }

        this.ctx.fillStyle = 'rgba(245, 245, 245, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.fireworks.length < 4 && Math.random() < 0.12) {
            this.createFirework();
        }

        this.fireworks = this.fireworks.filter(firework => firework.update());

        this.lastUpdate = timestamp;
        requestAnimationFrame((ts) => this.animate(ts));
    }

    start() {
        this.isRunning = true;
        requestAnimationFrame((ts) => this.animate(ts));
    }

    stop() {
        this.isRunning = false;
    }
}

const leftFireworks = new FireworksDisplay('fireworksLeft');
const rightFireworks = new FireworksDisplay('fireworksRight');

leftFireworks.start();
rightFireworks.start();
