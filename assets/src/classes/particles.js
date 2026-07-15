class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx ?? 0;
        this.vy = options.vy ?? 0;
        this.life = options.life ?? 32;
        this.maxLife = this.life;
        this.size = options.size ?? 4;
        this.color = options.color ?? "#ffffff";
        this.gravity = options.gravity ?? 0.04;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= 1;
        this.alpha = Math.max(0, this.life / this.maxLife);
        return this.life > 0;
    }

    draw(ctx, cameraX, cameraY) {
        const drawX = (cameraX - this.x) + (1920 / 2);
        const drawY = (cameraY - this.y) + (1080 / 2);

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emitBurst(x, y, colors, count = 10, speed = 2.2) {
        for (let index = 0; index < count; index += 1) {
            const angle = (Math.PI * 2 * index) / count + (Math.random() * 0.45);
            const velocity = speed * (0.4 + Math.random() * 0.8);
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 0.6,
                life: 18 + Math.floor(Math.random() * 18),
                size: 2 + Math.random() * 3,
                color: colors[index % colors.length],
                gravity: 0.02 + Math.random() * 0.04
            }));
        }
    }

    emitForAction(action, x, y) {
        switch (action) {
            case "planting":
                this.emitBurst(x, y, ["#8b5a2b", "#6fbf5f", "#b7e184"], 12, 1.8);
                break;
            case "harvest":
                this.emitBurst(x, y, ["#ffe680", "#f7c84c", "#7cd46a"], 18, 2.4);
                break;
            case "watering":
                this.emitBurst(x, y, ["#68b7ff", "#a3d8ff", "#d8f3ff"], 10, 1.6);
                break;
            default:
                this.emitBurst(x, y, ["#c6b18a", "#7ec866", "#f2f2f2"], 9, 1.5);
                break;
        }
    }

    updateAndDraw(ctx, cameraX, cameraY) {
        this.particles = this.particles.filter((particle) => particle.update());
        this.particles.forEach((particle) => particle.draw(ctx, cameraX, cameraY));
    }
}
