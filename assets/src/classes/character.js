class Character {
    constructor(ctx) {
        this.ctx = ctx;
        this.img = new Image();
        this.img.src = "assets/images/char.png";
        this.drawWidth = 42;
        this.drawHeight = 42;
        this.frame = 0;
        this.frameWidth = 16;
        this.frameHeight = 72 / 4;
        this.frameDelay = 18;
        this.frameCounter = 0;
        this.lastFrame = 2;
        this.direction = 2;
        this.speed = 0.5;
        this.sprint = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.toolAnimation = 0;
        this.maxEnergy = 100;
        this.energy = this.maxEnergy;
        this.exhausted = false;
    }

    isMoving() {
        return this.vx !== 0 || this.vy !== 0;
    }

    update() {
        this.x -= this.vx;
        this.y += this.vy;

        if (this.sprint && !this.exhausted) {
            this.x -= this.vx;
            this.y += this.vy;
        }

        this.y = AnimationHelpers.clamp(this.y, -5400, 5400);
        this.x = AnimationHelpers.clamp(this.x, -5400, 5400);

        if (this.frame > this.lastFrame) {
            this.frame = 0;
        }

        if (this.frameDelay < this.frameCounter) {
            this.frameCounter = 0;
            if (this.isMoving()) {
                this.frame += 1;
            } else {
                this.frame = 1;
            }
        }

        this.frameCounter += this.sprint && !this.exhausted ? 2 : 1;
        this.toolAnimation = Math.max(0, this.toolAnimation - 0.08);
    }

    draw() {
        const bounce = AnimationHelpers.pulse(1 - this.toolAnimation) * 6;
        const scale = 1 + (this.toolAnimation * 0.06);
        const centerX = 1920 / 2;
        const centerY = 1080 / 2;

        this.ctx.save();
        this.ctx.translate(centerX, centerY - bounce);
        this.ctx.scale(scale, scale);
        this.ctx.drawImage(
            this.img,
            this.frame * this.frameWidth,
            this.direction * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            -this.drawWidth / 2,
            -this.drawHeight / 2,
            this.drawWidth,
            this.drawHeight
        );
        this.ctx.restore();
    }

    setDirection(direction) {
        switch (direction) {
            case "up":
                this.direction = 0;
                break;
            case "right":
                this.direction = 1;
                break;
            case "down":
                this.direction = 2;
                break;
            case "left":
                this.direction = 3;
                break;
            default:
                break;
        }
    }

    triggerToolAnimation() {
        this.toolAnimation = 1;
    }

    setEnergy(energy, maxEnergy) {
        this.maxEnergy = maxEnergy;
        this.energy = energy;
        this.exhausted = this.energy <= 0;
    }

    getTargetTile() {
        const reach = 48;
        let targetX = this.x;
        let targetY = this.y;

        switch (this.direction) {
            case 0:
                targetY += reach;
                break;
            case 1:
                targetX += reach;
                break;
            case 2:
                targetY -= reach;
                break;
            case 3:
                targetX -= reach;
                break;
            default:
                break;
        }

        return { x: targetX, y: targetY };
    }

    getFacingTilePosition() {
        const targetTile = this.getTargetTile();

        return {
            x: snapToTileOrigin(targetTile.x),
            y: snapToTileOrigin(targetTile.y)
        };
    }

    getFacingPosition(distance = 48) {
        const targetTile = this.getTargetTile();
        const reachScale = distance / 48;

        return {
            x: this.x + ((targetTile.x - this.x) * reachScale),
            y: this.y + ((targetTile.y - this.y) * reachScale)
        };
    }
}
