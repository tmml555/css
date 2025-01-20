const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 设置canvas尺寸为窗口大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 定义左右两侧区域
const sideWidth = Math.min(300, window.innerWidth * 0.2); // 侧边区域宽度
const leftArea = {
    x: 0,
    width: sideWidth
};
const rightArea = {
    x: window.innerWidth - sideWidth,
    width: sideWidth
};

// 预定义的鲜艳颜色
const colors = [
    { h: 0, s: 100, l: 50 },    // 红色
    { h: 30, s: 100, l: 50 },   // 橙色
    { h: 60, s: 100, l: 50 },   // 黄色
    { h: 120, s: 100, l: 50 },  // 绿色
    { h: 180, s: 100, l: 50 },  // 青色
    { h: 240, s: 100, l: 50 },  // 蓝色
    { h: 300, s: 100, l: 50 },  // 紫色
    { h: 330, s: 100, l: 50 }   // 粉色
];

// 随机选择区域
function getRandomArea() {
    return Math.random() < 0.5 ? leftArea : rightArea;
}

// 获取区域内的随机X坐标
function getRandomX(area) {
    return area.x + Math.random() * area.width;
}

// 烟花类
class Firework {
    constructor() {
        const area = getRandomArea();
        const startX = getRandomX(area);
        const startY = canvas.height;
        const targetX = getRandomX(area);
        const targetY = random(canvas.height * 0.1, canvas.height * 0.5);

        this.x = startX;
        this.y = startY;
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.distanceToTarget = Math.sqrt(
            Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2)
        );
        this.distanceTraveled = 0;
        this.angle = Math.atan2(targetY - startY, targetX - startX);
        this.speed = 10;
        this.acceleration = 1.05;
        this.brightness = random(50, 80);
        this.targetRadius = 1;
        this.trail = [];
        this.trailLength = 7;
        this.exploded = false;
        this.particles = [];
        this.color = colors[Math.floor(random(0, colors.length))];
        this.area = area;
    }

    update() {
        if (!this.exploded) {
            this.trail.push([this.x, this.y]);
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            this.speed *= this.acceleration;
            let vx = Math.cos(this.angle) * this.speed;
            let vy = Math.sin(this.angle) * this.speed;
            this.distanceTraveled = Math.sqrt(
                Math.pow(this.x - this.startX, 2) + Math.pow(this.y - this.startY, 2)
            );

            if (this.distanceTraveled >= this.distanceToTarget) {
                this.explode();
            } else {
                this.x += vx;
                this.y += vy;
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            // 移除超出区域的粒子
            if (this.particles[i].alpha <= 0 || 
                this.particles[i].x < this.area.x || 
                this.particles[i].x > this.area.x + this.area.width) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0][0], this.trail[0][1]);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i][0], this.trail[i][1]);
            }
            ctx.strokeStyle = `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${1})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        for (let particle of this.particles) {
            particle.draw();
        }
    }

    explode() {
        this.exploded = true;
        const particleCount = 150;
        const baseHue = this.color.h;
        for (let i = 0; i < particleCount; i++) {
            const particle = new Particle(
                this.targetX,
                this.targetY,
                baseHue + random(-20, 20),
                this.area
            );
            this.particles.push(particle);
        }
    }
}

// 粒子类
class Particle {
    constructor(x, y, hue, area) {
        this.x = x;
        this.y = y;
        this.area = area;
        this.alpha = 1;
        this.radius = random(0.5, 2.5);
        this.angle = random(0, Math.PI * 2);
        this.speed = random(2, 8);
        this.friction = 0.95;
        this.gravity = 0.3;
        this.hue = hue;
        this.brightness = random(50, 90);
        this.decay = random(0.01, 0.02);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.fill();
    }
}

// 辅助函数
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// 存储所有烟花
const fireworks = [];

// 自动发射烟花
function autoLaunch() {
    if (fireworks.length < 8) {
        fireworks.push(new Firework());
    }
}

// 频繁自动发射
setInterval(autoLaunch, 300);

// 动画循环
function animate() {
    ctx.fillStyle = 'rgba(30, 60, 114, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();
        if (fireworks[i].exploded && fireworks[i].particles.length === 0) {
            fireworks.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// 窗口大小改变时更新区域
window.addEventListener('resize', () => {
    resizeCanvas();
    const sideWidth = Math.min(300, window.innerWidth * 0.2);
    leftArea.width = sideWidth;
    rightArea.x = window.innerWidth - sideWidth;
    rightArea.width = sideWidth;
});

// 启动动画
animate();
