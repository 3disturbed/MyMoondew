const TILE_SIZE = 32;
const CROP_STAGE_NAMES = ["seed", "sprouted", "ripe", "ready to harvest"];
const CROP_TYPES = {
    wheat: {
        label: "Wheat",
        seedItem: "Wheat Seeds",
        produceItem: "Wheat",
        stemColor: "#507638",
        cropColor: "#dfbe59"
    },
    tomato: {
        label: "Tomato",
        seedItem: "Tomato Seeds",
        produceItem: "Tomato",
        stemColor: "#4f7b39",
        cropColor: "#db5a4d"
    },
    corn: {
        label: "Corn",
        seedItem: "Corn Seeds",
        produceItem: "Corn",
        stemColor: "#5c8640",
        cropColor: "#f2cd44"
    },
    parsnip: {
        label: "Parsnip",
        seedItem: "Parsnip Seeds",
        produceItem: "Parsnip",
        stemColor: "#6a8040",
        cropColor: "#e8d070"
    },
    strawberry: {
        label: "Strawberry",
        seedItem: "Strawberry Seeds",
        produceItem: "Strawberry",
        stemColor: "#5c7840",
        cropColor: "#e03850"
    },
    blueberry: {
        label: "Blueberry",
        seedItem: "Blueberry Seeds",
        produceItem: "Blueberry",
        stemColor: "#4a6840",
        cropColor: "#5060e0"
    }
};

const tileImageLibrary = {
    grass: createWorldImage("Grass.png"),
    dirt: createWorldImage("Dirt.png"),
    stone: createWorldImage("Dirt.png"),
    tilled: createWorldImage("Plowed.png")
};

const TILE_DRAW_COLORS = {
    "forest-floor": ["#222d14", "#1e2910", "#263318", "#202c12"],
    "water":        ["#1a4e6a", "#1c5472", "#185060", "#1e567a"],
    "sand":         ["#b8945a", "#c09e60", "#b08c50", "#c4a064"],
    "stone-floor":  ["#525252", "#4e4e56", "#585858", "#4c4c52"],
    "path":         ["#6e4a16", "#78521a", "#645010", "#724e18"]
};

const cropSpriteCache = new Map();

function createWorldImage(fileName) {
    const image = new Image();
    image.src = `./assets/images/${fileName}`;
    return image;
}

function snapToTileOrigin(value) {
    return Math.round(value / TILE_SIZE) * TILE_SIZE;
}

function worldToScreen(worldX, worldY, characterX, characterY) {
    return {
        x: (characterX - worldX) + (1920 / 2),
        y: (characterY - worldY) + (1080 / 2)
    };
}

function getCropSprite(type, stage, watered) {
    const cacheKey = `${type}-${stage}-${watered ? "wet" : "dry"}`;

    if (cropSpriteCache.has(cacheKey)) {
        return cropSpriteCache.get(cacheKey);
    }

    const cropData = CROP_TYPES[type];
    const sprite = document.createElement("canvas");
    sprite.width = TILE_SIZE;
    sprite.height = TILE_SIZE;
    const spriteCtx = sprite.getContext("2d");

    if (watered) {
        spriteCtx.fillStyle = "rgba(77, 157, 245, 0.16)";
        spriteCtx.fillRect(0, TILE_SIZE - 10, TILE_SIZE, 10);
    }

    switch (stage) {
        case 0:
            spriteCtx.fillStyle = "#725136";
            spriteCtx.beginPath();
            spriteCtx.ellipse(16, 23, 7, 4, 0, 0, Math.PI * 2);
            spriteCtx.fill();
            spriteCtx.fillStyle = cropData.cropColor;
            spriteCtx.beginPath();
            spriteCtx.arc(16, 21, 2.5, 0, Math.PI * 2);
            spriteCtx.fill();
            break;
        case 1:
            spriteCtx.strokeStyle = cropData.stemColor;
            spriteCtx.lineWidth = 2;
            spriteCtx.beginPath();
            spriteCtx.moveTo(16, 24);
            spriteCtx.lineTo(16, 15);
            spriteCtx.stroke();
            spriteCtx.fillStyle = cropData.stemColor;
            spriteCtx.beginPath();
            spriteCtx.ellipse(12, 18, 4, 2.25, -0.5, 0, Math.PI * 2);
            spriteCtx.ellipse(20, 18, 4, 2.25, 0.5, 0, Math.PI * 2);
            spriteCtx.fill();
            break;
        case 2:
            spriteCtx.strokeStyle = cropData.stemColor;
            spriteCtx.lineWidth = 3;
            spriteCtx.beginPath();
            spriteCtx.moveTo(16, 24);
            spriteCtx.lineTo(16, 10);
            spriteCtx.stroke();
            spriteCtx.fillStyle = cropData.stemColor;
            spriteCtx.beginPath();
            spriteCtx.ellipse(11, 16, 5, 2.5, -0.6, 0, Math.PI * 2);
            spriteCtx.ellipse(21, 15, 5, 2.5, 0.6, 0, Math.PI * 2);
            spriteCtx.fill();
            spriteCtx.fillStyle = cropData.cropColor;
            spriteCtx.beginPath();
            spriteCtx.arc(13, 11.5, 3, 0, Math.PI * 2);
            spriteCtx.arc(19, 10.5, 3, 0, Math.PI * 2);
            spriteCtx.fill();
            break;
        default:
            spriteCtx.strokeStyle = cropData.stemColor;
            spriteCtx.lineWidth = 3;
            spriteCtx.beginPath();
            spriteCtx.moveTo(16, 25);
            spriteCtx.lineTo(16, 8);
            spriteCtx.stroke();
            spriteCtx.fillStyle = cropData.stemColor;
            spriteCtx.beginPath();
            spriteCtx.ellipse(10, 16, 6, 2.5, -0.7, 0, Math.PI * 2);
            spriteCtx.ellipse(22, 14, 6, 2.5, 0.7, 0, Math.PI * 2);
            spriteCtx.fill();
            spriteCtx.fillStyle = cropData.cropColor;
            spriteCtx.beginPath();
            spriteCtx.arc(11, 11, 3.5, 0, Math.PI * 2);
            spriteCtx.arc(16, 9, 3.5, 0, Math.PI * 2);
            spriteCtx.arc(21, 11, 3.5, 0, Math.PI * 2);
            spriteCtx.fill();
            spriteCtx.strokeStyle = "rgba(255, 247, 190, 0.95)";
            spriteCtx.lineWidth = 1.5;
            spriteCtx.strokeRect(6, 6, 20, 20);
            break;
    }

    cropSpriteCache.set(cacheKey, sprite);
    return sprite;
}

class Crop {
    constructor(type, stage = 0, waterLevel = 0, daysAlive = 0) {
        this.type = type;
        this.stage = stage;
        this.waterLevel = waterLevel;
        this.daysAlive = daysAlive;
    }

    get typeData() {
        return CROP_TYPES[this.type];
    }

    get stageName() {
        return CROP_STAGE_NAMES[this.stage];
    }

    isWatered() {
        return this.waterLevel > 0;
    }

    isReadyToHarvest() {
        return this.stage >= CROP_STAGE_NAMES.length - 1;
    }

    water() {
        this.waterLevel = 1;
    }

    advanceDay() {
        const wateredToday = this.isWatered();
        const previousStage = this.stage;

        this.daysAlive++;

        if (wateredToday && !this.isReadyToHarvest()) {
            this.stage++;
        }

        this.waterLevel = 0;

        return {
            wateredToday,
            grew: this.stage > previousStage,
            stage: this.stage
        };
    }

    serialize() {
        return {
            type: this.type,
            stage: this.stage,
            waterLevel: this.waterLevel,
            daysAlive: this.daysAlive
        };
    }

    static fromState(state) {
        return new Crop(state.type, state.stage || 0, state.waterLevel || 0, state.daysAlive || 0);
    }

    draw(ctx, screenX, screenY) {
        ctx.drawImage(getCropSprite(this.type, this.stage, this.isWatered()), screenX, screenY, TILE_SIZE, TILE_SIZE);
    }
}

class WorldItem {
    constructor(item, x, y) {
        this.item = item;
        this.x = x;
        this.y = y;
        this.size = 28;
    }

    draw(ctx, characterX, characterY) {
        const screenPosition = worldToScreen(this.x, this.y, characterX, characterY);

        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(screenPosition.x, screenPosition.y + 16, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        this.item.drawIcon(ctx, screenPosition.x - (this.size / 2), screenPosition.y - this.size, this.size);
    }

    wasClicked(screenX, screenY, characterX, characterY) {
        const screenPosition = worldToScreen(this.x, this.y, characterX, characterY);
        const halfSize = this.size / 2;

        return screenX >= screenPosition.x - halfSize
            && screenX <= screenPosition.x + halfSize
            && screenY >= screenPosition.y - this.size
            && screenY <= screenPosition.y;
    }

    distanceTo(x, y) {
        return Math.hypot(this.x - x, this.y - y);
    }
}

class WorldTree {
    constructor(x, y, type = "oak") {
        this.x = x;
        this.y = y;
        this.type = type;
        this.health = 3;
        this.maxHealth = 3;
        this.fallen = false;
    }

    chop() {
        if (this.fallen) {
            return false;
        }
        this.health = Math.max(0, this.health - 1);
        if (this.health === 0) {
            this.fallen = true;
        }
        return true;
    }

    regrow() {
        this.health = this.maxHealth;
        this.fallen = false;
    }

    distanceTo(x, y) {
        return Math.hypot(this.x - x, this.y - y);
    }

    draw(ctx, characterX, characterY) {
        if (this.distanceTo(characterX, characterY) > 960) {
            return;
        }
        const sp = worldToScreen(this.x, this.y, characterX, characterY);
        const cx = sp.x + TILE_SIZE / 2;
        const cy = sp.y + TILE_SIZE / 2;

        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 13, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const trunkColor = this.type === "pine" ? "#5a3a18" : "#6b4422";
        ctx.fillStyle = trunkColor;
        ctx.fillRect(cx - 5, cy - 4, 10, TILE_SIZE / 2 + 6);

        if (this.fallen) {
            ctx.fillStyle = "#7a5a28";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 8, 11, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#a07840";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 7, 8, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        if (this.type === "pine") {
            const leafColor = this.health < 2 ? "#496028" : "#2a5018";
            ctx.fillStyle = leafColor;
            ctx.beginPath();
            ctx.moveTo(cx, cy - TILE_SIZE);
            ctx.lineTo(cx + 22, cy + 2);
            ctx.lineTo(cx - 22, cy + 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = this.health < 2 ? "#587030" : "#366020";
            ctx.beginPath();
            ctx.moveTo(cx, cy - TILE_SIZE - 14);
            ctx.lineTo(cx + 14, cy - TILE_SIZE / 2);
            ctx.lineTo(cx - 14, cy - TILE_SIZE / 2);
            ctx.closePath();
            ctx.fill();
        } else {
            const leafColor = this.health < 2 ? "#50782a" : "#3c6c20";
            ctx.fillStyle = leafColor;
            ctx.beginPath();
            ctx.arc(cx, cy - TILE_SIZE / 2 - 2, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.health < 2 ? "#5e8830" : "#487826";
            ctx.beginPath();
            ctx.arc(cx - 10, cy - TILE_SIZE / 2 + 6, 14, 0, Math.PI * 2);
            ctx.arc(cx + 10, cy - TILE_SIZE / 2 + 6, 14, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.health < this.maxHealth) {
            ctx.strokeStyle = "rgba(255, 160, 0, 0.85)";
            ctx.lineWidth = 2;
            const cracks = this.maxHealth - this.health;
            for (let i = 0; i < cracks; i++) {
                ctx.beginPath();
                ctx.moveTo(cx - 5 + i * 6, cy - 6);
                ctx.lineTo(cx + 1 + i * 6, cy + 4);
                ctx.stroke();
            }
        }
    }
}

class WorldRock {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 3;
        this.maxHealth = 3;
        this.broken = false;
        const seed = (((x * 73856093) ^ (y * 19349663)) >>> 0) & 0xFFFF;
        this.variant = seed % 3;
        this.scaleX = 0.85 + (seed % 4) * 0.06;
        this.scaleY = 0.78 + ((seed >> 4) % 4) * 0.06;
    }

    mine() {
        if (this.broken) {
            return false;
        }
        this.health = Math.max(0, this.health - 1);
        if (this.health === 0) {
            this.broken = true;
        }
        return true;
    }

    regrow() {
        this.health = this.maxHealth;
        this.broken = false;
    }

    distanceTo(x, y) {
        return Math.hypot(this.x - x, this.y - y);
    }

    draw(ctx, characterX, characterY) {
        if (this.broken || this.distanceTo(characterX, characterY) > 960) {
            return;
        }
        const sp = worldToScreen(this.x, this.y, characterX, characterY);
        const cx = sp.x + TILE_SIZE / 2;
        const cy = sp.y + TILE_SIZE / 2 + 4;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(this.scaleX, this.scaleY);

        ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
        ctx.beginPath();
        ctx.ellipse(0, 12, 20, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        const palettes = [
            ["#787878", "#656565", "#8e8e8e"],
            ["#6a6a8a", "#585870", "#7c7c9c"],
            ["#8a7a6a", "#7a6858", "#9a8a7a"]
        ];
        const [mid, dark, light] = palettes[this.variant];

        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.ellipse(-2, 0, 18, 13, -0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = dark;
        ctx.beginPath();
        ctx.ellipse(-2, 5, 18, 10, -0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.ellipse(-8, -6, 8, 5, -0.5, 0, Math.PI * 2);
        ctx.fill();

        if (this.health < this.maxHealth) {
            ctx.strokeStyle = "rgba(255, 80, 0, 0.75)";
            ctx.lineWidth = 2;
            for (let i = 0; i < this.maxHealth - this.health; i++) {
                ctx.beginPath();
                ctx.moveTo(-6 + i * 7, -8);
                ctx.lineTo(-2 + i * 7, -2);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

class WorldBuilding {
    constructor(x, y, type, label) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.label = label;
        this.interactRadius = 160;
    }

    distanceTo(x, y) {
        return Math.hypot(this.x - x, this.y - y);
    }

    isNearby(x, y) {
        return this.distanceTo(x, y) <= this.interactRadius;
    }

    draw(ctx, characterX, characterY) {
        if (this.distanceTo(characterX, characterY) > 1400) {
            return;
        }
        const sp = worldToScreen(this.x, this.y, characterX, characterY);

        if (this.type === "shop") {
            this.drawShop(ctx, sp.x, sp.y);
        } else if (this.type === "mine") {
            this.drawMine(ctx, sp.x, sp.y);
        }
    }

    drawShop(ctx, x, y) {
        ctx.fillStyle = "#4a3010";
        ctx.fillRect(x - 32, y - 20, 80, 52);
        ctx.fillStyle = "#8b6228";
        ctx.fillRect(x - 28, y - 16, 72, 44);
        ctx.fillStyle = "#b03c20";
        ctx.beginPath();
        ctx.moveTo(x - 36, y - 20);
        ctx.lineTo(x + 52, y - 20);
        ctx.lineTo(x + 8, y - 52);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#3a2008";
        ctx.fillRect(x + 4, y + 6, 16, 22);
        ctx.fillStyle = "#f0d060";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Shop", x + 8, y - 2);
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.font = "11px Arial";
        ctx.fillText("(Coming soon)", x + 8, y + 40);
    }

    drawMine(ctx, x, y) {
        ctx.fillStyle = "#504050";
        ctx.fillRect(x - 28, y - 12, 68, 48);
        ctx.fillStyle = "#3a3040";
        ctx.beginPath();
        ctx.arc(x + 6, y - 4, 24, Math.PI, 0, false);
        ctx.rect(x - 18, y - 4, 48, 40);
        ctx.fill();
        ctx.fillStyle = "#0a0810";
        ctx.beginPath();
        ctx.arc(x + 6, y - 4, 17, Math.PI, 0, false);
        ctx.rect(x - 11, y - 4, 34, 30);
        ctx.fill();
        ctx.fillStyle = "#c8a860";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Mine", x + 6, y + 44);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "11px Arial";
        ctx.fillText("(Explore deeper)", x + 6, y + 58);
    }
}

class Tile {
    constructor(x, y, type, owned, drawDis) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.owned = owned;
        this.drawDis = drawDis;
        this.tilled = false;
        this.crop = null;
        this.img = tileImageLibrary[type] || tileImageLibrary.dirt;
    }

    distance(x, y) {
        return Math.abs(x - this.x) + Math.abs(y - this.y);
    }

    isWatered() {
        return !!this.crop && this.crop.isWatered();
    }

    getTileImage() {
        return this.tilled ? tileImageLibrary.tilled : this.img;
    }

    serialize() {
        return {
            x: this.x,
            y: this.y,
            tilled: this.tilled,
            crop: this.crop ? this.crop.serialize() : null
        };
    }

    draw(ctx, characterX, characterY) {
        if (this.distance(characterX, characterY) > this.drawDis) {
            return;
        }

        const screenPosition = worldToScreen(this.x, this.y, characterX, characterY);

        if (TILE_DRAW_COLORS[this.type]) {
            const colors = TILE_DRAW_COLORS[this.type];
            const hash = (((this.x * 31) ^ (this.y * 37)) >>> 0) & 0xFF;
            ctx.fillStyle = colors[hash % colors.length];
            ctx.fillRect(screenPosition.x, screenPosition.y, TILE_SIZE, TILE_SIZE);
            if (this.type === "water") {
                const wavePhase = ((this.x + this.y) >> 5) & 0x1;
                if (wavePhase) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
                    ctx.fillRect(screenPosition.x + 4, screenPosition.y + 6, TILE_SIZE - 8, 3);
                }
            }
        } else {
            ctx.drawImage(this.getTileImage(), screenPosition.x, screenPosition.y, TILE_SIZE, TILE_SIZE);
        }

        if (this.tilled && this.isWatered()) {
            ctx.fillStyle = "rgba(77, 157, 245, 0.2)";
            ctx.fillRect(screenPosition.x, screenPosition.y, TILE_SIZE, TILE_SIZE);
        }

        if (this.crop) {
            this.crop.draw(ctx, screenPosition.x, screenPosition.y);
        }
    }
}

class World {
    constructor(drawDis) {
        this.tiles = [];
        this.tileMap = new Map();
        this.items = [];
        this.cropData = new Map();
        this.trees = [];
        this.rocks = [];
        this.buildings = [];
        this.day = 1;

        for (let x = -200; x < 200; x++) {
            for (let y = -200; y < 200; y++) {
                const tileType = this.getZoneTileType(x, y);
                const tile = new Tile(x * TILE_SIZE, y * TILE_SIZE, tileType, false, drawDis);
                this.tiles.push(tile);
                this.tileMap.set(this.getTileKey(tile.x, tile.y), tile);
            }
        }

        this.generateTrees();
        this.generateRocks();
        this.generateBuildings();
        this.seedStarterItems();
    }

    getTileKey(x, y) {
        return `${x},${y}`;
    }

    getZoneTileType(tx, ty) {
        const ax = Math.abs(tx);
        const ay = Math.abs(ty);

        if (ax <= 9 && ay <= 9) {
            const hash = (((tx * 31) ^ (ty * 37)) >>> 0) & 0xF;
            return hash < 5 ? "dirt" : "grass";
        }

        if (ax <= 1 && ty > 9 && ty < 32) {
            return "path";
        }

        if (ty < -14) {
            const hash = (((tx * 53) ^ (ty * 71)) >>> 0) & 0xF;
            return hash < 4 ? "grass" : "forest-floor";
        }

        if (ty >= -14 && ty < -9) {
            const hash = (((tx * 53) ^ (ty * 71)) >>> 0) & 0xF;
            return hash < 7 ? "grass" : "forest-floor";
        }

        if (tx < -14 && ty < 10) {
            const hash = (((tx * 41) ^ (ty * 59)) >>> 0) & 0xF;
            return hash < 4 ? "dirt" : "stone-floor";
        }

        if (tx >= -14 && tx < -9 && ty < 2) {
            const hash = (((tx * 41) ^ (ty * 59)) >>> 0) & 0xF;
            return hash < 7 ? "grass" : "stone-floor";
        }

        if (ty > 14) {
            const hash = (((tx * 29) ^ (ty * 47)) >>> 0) & 0xF;
            return hash < 13 ? "grass" : "dirt";
        }

        if (tx > 30 && tx <= 40) {
            return "sand";
        }

        if (tx > 40) {
            return "water";
        }

        if (tx > 20 && tx <= 30) {
            const hash = (((tx * 67) ^ (ty * 83)) >>> 0) & 0xF;
            return hash < 7 ? "sand" : "grass";
        }

        const hash = (((tx * 73) ^ (ty * 97)) >>> 0) & 0xF;
        return hash < 6 ? "dirt" : "grass";
    }

    generateTrees() {
        this.trees = [];
        // North Forest zone – grid of 8-tile cells
        for (let gx = -13; gx <= 13; gx++) {
            for (let gy = -18; gy <= -2; gy++) {
                const h = (((gx * 73856093) ^ (gy * 19349663)) >>> 0) & 0xFFFF;
                if (h % 4 !== 0) {
                    continue;
                }
                const ox = ((h >> 8) & 0x7) - 3;
                const oy = ((h >> 12) & 0x7) - 3;
                const wx = (gx * 8 + ox) * TILE_SIZE;
                const wy = (gy * 8 + oy) * TILE_SIZE;
                if (Math.abs(wx) < 352 && Math.abs(wy) < 352) {
                    continue;
                }
                this.trees.push(new WorldTree(wx, wy, gy < -8 ? "pine" : "oak"));
            }
        }
        // South Meadow – sparser oaks
        for (let gx = -10; gx <= 10; gx++) {
            for (let gy = 2; gy <= 14; gy++) {
                const h = (((gx * 65537) ^ (gy * 131071)) >>> 0) & 0xFFFF;
                if (h % 6 !== 0) {
                    continue;
                }
                const ox = ((h >> 8) & 0x7) - 3;
                const oy = ((h >> 12) & 0x7) - 3;
                const wx = (gx * 8 + ox) * TILE_SIZE;
                const wy = (gy * 8 + oy) * TILE_SIZE;
                this.trees.push(new WorldTree(wx, wy, "oak"));
            }
        }
        // Starter trees visible from home
        [[192, -128, "oak"], [-224, -128, "pine"], [160, 192, "oak"], [-192, 192, "oak"]].forEach(([x, y, type]) => {
            this.trees.push(new WorldTree(x, y, type));
        });
    }

    generateRocks() {
        this.rocks = [];
        // West Rocky Hills zone
        for (let gx = -18; gx <= -2; gx++) {
            for (let gy = -12; gy <= 8; gy++) {
                const h = (((gx * 73856093) ^ (gy * 19349663)) >>> 0) & 0xFFFF;
                if (h % 4 !== 0) {
                    continue;
                }
                const ox = ((h >> 8) & 0x7) - 3;
                const oy = ((h >> 12) & 0x7) - 3;
                const wx = (gx * 8 + ox) * TILE_SIZE;
                const wy = (gy * 8 + oy) * TILE_SIZE;
                if (Math.abs(wx) < 352 && Math.abs(wy) < 352) {
                    continue;
                }
                this.rocks.push(new WorldRock(wx, wy));
            }
        }
        // Starter rocks near home
        [[-192, -160], [224, -128], [-224, 192], [192, 224]].forEach(([x, y]) => {
            this.rocks.push(new WorldRock(x, y));
        });
    }

    generateBuildings() {
        this.buildings = [
            new WorldBuilding(288, 832, "shop", "Shop"),
            new WorldBuilding(-1056, -1056, "mine", "Mine")
        ];
    }

    getTileAt(x, y) {
        return this.tileMap.get(this.getTileKey(x, y)) || null;
    }

    getTileAtWorldPosition(x, y) {
        return this.getTileAt(snapToTileOrigin(x), snapToTileOrigin(y));
    }

    screenToWorld(screenX, screenY, characterX, characterY) {
        return {
            x: snapToTileOrigin(characterX + ((1920 / 2) - screenX) + (TILE_SIZE / 2)),
            y: snapToTileOrigin(characterY + ((1080 / 2) - screenY) + (TILE_SIZE / 2))
        };
    }

    canInteractWithTile(tile, character) {
        return !!tile && tile.distance(character.x, character.y) <= 96;
    }

    describeTile(tile) {
        if (!tile) {
            return "No tile selected";
        }

        if (tile.crop) {
            const waterState = tile.crop.isWatered() ? "watered" : "dry";
            return `${tile.crop.typeData.label} • ${tile.crop.stageName} • ${waterState}`;
        }

        if (tile.tilled) {
            return "Tilled soil";
        }

        return `${tile.type} soil`;
    }

    seedStarterItems() {
        this.spawnDroppedItem(createItem("Wheat Seeds", {quantity: 4}), -96, -32);
        this.spawnDroppedItem(createItem("Tomato Seeds", {quantity: 4}), -32, -32);
        this.spawnDroppedItem(createItem("Corn Seeds", {quantity: 4}), 32, -32);
        this.spawnDroppedItem(createItem("Parsnip Seeds", {quantity: 4}), 96, -64);
        this.spawnDroppedItem(createItem("Strawberry Seeds", {quantity: 3}), -64, 64);
        this.spawnDroppedItem(createItem("Wood", {quantity: 12}), 96, -32);
        this.spawnDroppedItem(createItem("Stone", {quantity: 10}), -32, 96);
        this.spawnDroppedItem(createItem("Axe"), 96, 96);
        this.spawnDroppedItem(createItem("Pickaxe"), -96, 96);
        this.spawnDroppedItem(createItem("Fishing Rod"), 128, -96);
    }

    spawnDroppedItem(item, x, y) {
        this.items.push(new WorldItem(item, x, y));
    }

    pickupAtScreenPosition(screenX, screenY, character, inventory) {
        for (let index = this.items.length - 1; index >= 0; index--) {
            const worldItem = this.items[index];

            if (!worldItem.wasClicked(screenX, screenY, character.x, character.y)) {
                continue;
            }

            if (worldItem.distanceTo(character.x, character.y) > 180) {
                return {handled: true, success: false, message: "That item is too far away."};
            }

            const pickupResult = inventory.addItem(worldItem.item);

            if (pickupResult.remaining > 0) {
                worldItem.item.quantity = pickupResult.remaining;
                return {handled: true, success: false, message: "Inventory is full."};
            } else {
                this.items.splice(index, 1);
                return {
                    handled: true,
                    success: true,
                    message: `Picked up ${worldItem.item.name}.`,
                    item: worldItem.item
                };
            }
        }

        return null;
    }

    getInteractionTile(character, preferredTile = null) {
        if (preferredTile && this.canInteractWithTile(preferredTile, character)) {
            return preferredTile;
        }

        const facingTile = character.getFacingTilePosition();
        return this.getTileAt(facingTile.x, facingTile.y);
    }

    tillTile(tile, preview = false) {
        if (!tile) {
            return {success: false, message: "Move closer to the soil."};
        }

        const untillable = new Set(["stone", "water", "forest-floor", "stone-floor"]);
        if (untillable.has(tile.type)) {
            return {success: false, message: "That ground cannot be tilled."};
        }

        if (tile.tilled) {
            return {success: false, message: tile.crop ? "That tile is already planted." : "That soil is already tilled."};
        }

        if (!preview) {
            tile.tilled = true;
        }
        return {success: true, message: "Soil tilled."};
    }

    plantCrop(tile, cropType, preview = false) {
        if (!tile) {
            return {success: false, message: "Move closer to the soil."};
        }

        if (!tile.tilled) {
            return {success: false, message: "Till the soil before planting."};
        }

        if (tile.crop) {
            return {success: false, message: "That tile already has a crop."};
        }

        const crop = new Crop(cropType);

        if (!preview) {
            tile.crop = crop;
            this.cropData.set(this.getTileKey(tile.x, tile.y), crop);
        }

        return {success: true, message: `${crop.typeData.label} planted.`};
    }

    waterCrop(tile, preview = false) {
        if (!tile) {
            return {success: false, message: "Move closer to the crop."};
        }

        if (!tile.crop) {
            return {success: false, message: "There is nothing planted there."};
        }

        if (!preview) {
            tile.crop.water();
        }
        return {success: true, message: `${tile.crop.typeData.label} watered.`};
    }

    harvestCrop(tile, preview = false) {
        if (!tile) {
            return {success: false, message: "Move closer to the crop."};
        }

        if (!tile.crop) {
            return {success: false, message: "There is nothing to harvest."};
        }

        if (!tile.crop.isReadyToHarvest()) {
            return {success: false, message: "That crop is not ready to harvest."};
        }

        const harvestedCrop = tile.crop;
        if (!preview) {
            tile.crop = null;
            this.cropData.delete(this.getTileKey(tile.x, tile.y));
        }

        return {
            success: true,
            message: `${harvestedCrop.typeData.label} harvested.`,
            cropType: harvestedCrop.type,
            produceItem: harvestedCrop.typeData.produceItem
        };
    }

    addItemToInventoryOrWorld(inventory, item, x, y) {
        const result = inventory.addItem(item);

        if (result.remaining > 0) {
            this.spawnDroppedItem(item.clone(result.remaining), x, y);
            return false;
        }

        return true;
    }

    getSeedTypeFromInventory(inventory) {
        const seedMap = {
            "Parsnip Seeds": "parsnip",
            "Wheat Seeds": "wheat",
            "Tomato Seeds": "tomato",
            "Corn Seeds": "corn",
            "Strawberry Seeds": "strawberry",
            "Blueberry Seeds": "blueberry"
        };

        for (const [itemName, cropType] of Object.entries(seedMap)) {
            if (inventory.countItem(itemName) > 0) {
                return {itemName, cropType};
            }
        }

        return null;
    }

    getNearestTree(x, y, radius = 96) {
        let nearest = null;
        let nearestDist = radius;
        this.trees.forEach((tree) => {
            if (tree.fallen) {
                return;
            }
            const dist = tree.distanceTo(x, y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = tree;
            }
        });
        return nearest;
    }

    getNearestRock(x, y, radius = 96) {
        let nearest = null;
        let nearestDist = radius;
        this.rocks.forEach((rock) => {
            if (rock.broken) {
                return;
            }
            const dist = rock.distanceTo(x, y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = rock;
            }
        });
        return nearest;
    }

    isNearWater(x, y, radius = 160) {
        const steps = Math.ceil(radius / TILE_SIZE) + 1;
        for (let dx = -steps; dx <= steps; dx++) {
            for (let dy = -steps; dy <= steps; dy++) {
                const tx = snapToTileOrigin(x + dx * TILE_SIZE);
                const ty = snapToTileOrigin(y + dy * TILE_SIZE);
                const tile = this.getTileAt(tx, ty);
                if (tile && tile.type === "water") {
                    return true;
                }
            }
        }
        return false;
    }

    interact(targetX, targetY, selectedItem, inventory) {
        const tile = this.getTileAtWorldPosition(targetX, targetY);

        if (!tile) {
            return {success: false, message: "Move closer to the field."};
        }

        switch (selectedItem.mode) {
            case 1: {
                const result = this.tillTile(tile);
                return result.success ? {...result, energyCost: 2, action: "planting", shake: 1.2} : result;
            }
            case 2: {
                const nextSeed = this.getSeedTypeFromInventory(inventory);

                if (!nextSeed) {
                    return {success: false, message: "Pick up some seeds before planting."};
                }

                const planted = this.plantCrop(tile, nextSeed.cropType);

                if (!planted.success) {
                    return planted;
                }

                inventory.removeByName(nextSeed.itemName, 1);
                return {
                    ...planted,
                    message: `${planted.message} (${nextSeed.itemName} -1)`,
                    energyCost: 1,
                    action: "planting",
                    shake: 1
                };
            }
            case 3: {
                const watered = this.waterCrop(tile);
                return watered.success ? {...watered, energyCost: 1, action: "watering", shake: 0.8} : watered;
            }
            case 4: {
                const harvest = this.harvestCrop(tile);

                if (!harvest.success) {
                    return harvest;
                }

                const stored = this.addItemToInventoryOrWorld(inventory, createItem(harvest.produceItem, {quantity: 2}), tile.x, tile.y);
                return {
                    success: true,
                    message: stored ? harvest.message : `${harvest.message} Inventory full, so some produce dropped nearby.`,
                    energyCost: 1,
                    action: "harvest",
                    shake: 1.4
                };
            }
            case 5:
                if (!tile.crop) {
                    return {success: false, message: "Use fertilizer on a planted crop."};
                }
                tile.crop.stage = Math.min(CROP_STAGE_NAMES.length - 1, tile.crop.stage + 1);
                return {success: true, message: `${tile.crop.typeData.label} got a growth boost.`, energyCost: 1, action: "planting", shake: 0.8};
            case 6: {
                const stored = this.addItemToInventoryOrWorld(inventory, createItem("Wood", {quantity: 3}), tile.x, tile.y);
                return {
                    success: true,
                    message: stored ? "You gathered wood." : "You gathered wood, but dropped some nearby.",
                    energyCost: 2,
                    action: "harvest",
                    shake: 2.4
                };
            }
            case 7: {
                const stored = this.addItemToInventoryOrWorld(inventory, createItem("Stone", {quantity: 3}), tile.x, tile.y);
                return {
                    success: true,
                    message: stored ? "You cracked out some stone." : "You cracked out stone, but dropped some nearby.",
                    energyCost: 2,
                    action: "harvest",
                    shake: 2.6
                };
            }
            case 8:
                return {success: true, message: "You practice a quick sword swing.", energyCost: 1, action: "default", shake: 1.6};
            case 9:
                return {success: true, message: "You sweep the net through the grass.", energyCost: 1, action: "default", shake: 1.2};
            default:
                return {success: false, message: "Select a tool to use."};
        }
    }

    useItem(character, selectedItem, inventory, gameState, preferredTile = null) {
        if (!selectedItem) {
            return "Selected slot is empty.";
        }

        if (selectedItem.type !== ITEM_TYPES.TOOL) {
            return `${selectedItem.name} is stored. Select a tool to use it.`;
        }

        const energyCosts = {
            "Hoe": 6,
            "Trowel": 4,
            "Watering Can": 3,
            "Scythe": 2,
            "Fertilizer Bucket": 4,
            "Axe": 7,
            "Pickaxe": 7,
            "Sword": 5,
            "Net": 3
        };
        const energyCost = energyCosts[selectedItem.name] || 1;

        if (gameState.energy < energyCost) {
            return "Too exhausted. Head home and press S to sleep.";
        }

        const tile = this.getInteractionTile(character, preferredTile);
        let actionResult = {success: false, message: `${selectedItem.name} is ready.`};

        switch (selectedItem.name) {
            case "Hoe":
                actionResult = this.tillTile(tile);
                break;
            case "Trowel": {
                const seedItemName = typeof getSelectedSeedItemName === "function" ? getSelectedSeedItemName() : null;

                if (!seedItemName) {
                    return "No seeds are available to plant.";
                }

                const cropType = Object.keys(CROP_TYPES).find((cropName) => CROP_TYPES[cropName].seedItem === seedItemName);
                actionResult = this.plantCrop(tile, cropType);

                if (actionResult.success) {
                    inventory.removeByName(seedItemName, 1);
                }
                break;
            }
            case "Watering Can":
                actionResult = this.waterCrop(tile);
                break;
            case "Scythe":
                actionResult = this.harvestCrop(tile);

                if (actionResult.success && actionResult.produceItem) {
                    const harvestItem = createItem(actionResult.produceItem);
                    const addResult = inventory.addItem(harvestItem);

                    if (addResult.remaining > 0) {
                        this.spawnDroppedItem(createItem(actionResult.produceItem, {quantity: addResult.remaining}), character.x, character.y);
                        actionResult.message += " Inventory full, so the crop fell to the ground.";
                    }
                }
                break;
            case "Fertilizer Bucket":
                if (!tile?.crop) {
                    actionResult = {success: false, message: "Use fertilizer on a planted crop."};
                    break;
                }

                if (tile.crop.isReadyToHarvest()) {
                    actionResult = {success: false, message: "That crop is already fully grown."};
                    break;
                }

                tile.crop.stage = Math.min(CROP_STAGE_NAMES.length - 1, tile.crop.stage + 1);
                actionResult = {success: true, message: `${tile.crop.typeData.label} got a growth boost.`};
                break;
            case "Axe": {
                const stored = this.addItemToInventoryOrWorld(inventory, createItem("Wood", {quantity: 3}), character.x, character.y);
                actionResult = {success: true, message: stored ? "You gathered wood." : "You gathered wood, but dropped some nearby."};
                break;
            }
            case "Pickaxe": {
                const stored = this.addItemToInventoryOrWorld(inventory, createItem("Stone", {quantity: 3}), character.x, character.y);
                actionResult = {success: true, message: stored ? "You cracked out some stone." : "You cracked out stone, but dropped some nearby."};
                break;
            }
            case "Sword":
                actionResult = {success: true, message: "You practice a quick sword swing."};
                break;
            case "Net":
                actionResult = {success: true, message: "You sweep the net through the grass."};
                break;
            default:
                return `Using ${selectedItem.name}.`;
        }

        if (actionResult.success) {
            gameState.consumeEnergy(energyCost, character);
            character.triggerToolAnimation();
        }

        return actionResult.message;
    }

    serializeFarmState() {
        const farmTiles = [];

        this.tiles.forEach((tile) => {
            if (tile.tilled || tile.crop) {
                farmTiles.push(tile.serialize());
            }
        });

        return farmTiles;
    }

    loadFarmState(farmTiles) {
        this.cropData.clear();

        this.tiles.forEach((tile) => {
            tile.tilled = false;
            tile.crop = null;
        });

        farmTiles.forEach((tileState) => {
            const tile = this.getTileAt(tileState.x, tileState.y);

            if (!tile) {
                return;
            }

            tile.tilled = !!tileState.tilled;
            tile.crop = tileState.crop ? Crop.fromState(tileState.crop) : null;

            if (tile.crop) {
                this.cropData.set(this.getTileKey(tile.x, tile.y), tile.crop);
            }
        });
    }

    reset() {
        this.cropData.clear();
        this.items = [];
        this.tiles.forEach((tile) => {
            tile.tilled = false;
            tile.crop = null;
        });
        this.trees.forEach((tree) => tree.regrow());
        this.rocks.forEach((rock) => rock.regrow());
        this.seedStarterItems();
    }

    getLocationName(x, y) {
        if (Math.abs(x) <= 128 && Math.abs(y) <= 128) {
            return "Homestead";
        }
        if (y < -512 && x > -512) {
            return "Forest";
        }
        if (y < -512) {
            return "Deep Forest";
        }
        if (x < -512 && y < 512) {
            return "Rocky Hills";
        }
        if (x > 1280) {
            return "East River";
        }
        if (x > 640) {
            return "River Valley";
        }
        if (y > 512) {
            return "South Meadow";
        }
        if (y > 256 && Math.abs(x) < 256) {
            return "Town Road";
        }
        return "Fields";
    }

    serializeDroppedItems() {
        return this.items.map((worldItem) => ({
            item: {
                name: worldItem.item.name,
                quantity: worldItem.item.quantity
            },
            x: worldItem.x,
            y: worldItem.y
        }));
    }

    loadDroppedItems(droppedItems) {
        this.items = [];

        (droppedItems || []).forEach((droppedItem) => {
            const itemName = droppedItem?.item?.name || droppedItem?.name;
            const quantity = droppedItem?.item?.quantity || droppedItem?.quantity || 1;

            if (!itemName) {
                return;
            }

            this.spawnDroppedItem(createItem(itemName, {quantity}), droppedItem.x || 0, droppedItem.y || 0);
        });
    }

    drawTileHighlight(ctx, tile, characterX, characterY) {
        if (!tile) {
            return;
        }

        const screenPosition = worldToScreen(tile.x, tile.y, characterX, characterY);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenPosition.x + 1, screenPosition.y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    drawHomeArea(ctx, characterX, characterY) {
        // Farmhouse (centred slightly north of the home zone)
        const houseSp = worldToScreen(0, -112, characterX, characterY);
        const hx = houseSp.x;
        const hy = houseSp.y;

        ctx.save();
        // House body
        ctx.fillStyle = "#6a4a20";
        ctx.fillRect(hx - 46, hy - 24, 92, 60);
        ctx.fillStyle = "#8b6230";
        ctx.fillRect(hx - 42, hy - 20, 84, 52);
        // Roof
        ctx.fillStyle = "#8a3818";
        ctx.beginPath();
        ctx.moveTo(hx - 52, hy - 24);
        ctx.lineTo(hx + 52, hy - 24);
        ctx.lineTo(hx, hy - 66);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#a04020";
        ctx.beginPath();
        ctx.moveTo(hx - 46, hy - 24);
        ctx.lineTo(hx + 46, hy - 24);
        ctx.lineTo(hx, hy - 60);
        ctx.closePath();
        ctx.fill();
        // Windows
        ctx.fillStyle = "#a8d4f8";
        ctx.fillRect(hx - 34, hy - 12, 20, 15);
        ctx.fillRect(hx + 14, hy - 12, 20, 15);
        // Window cross
        ctx.strokeStyle = "#6a4020";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hx - 34, hy - 12, 20, 15);
        ctx.strokeRect(hx + 14, hy - 12, 20, 15);
        ctx.beginPath();
        ctx.moveTo(hx - 24, hy - 12);
        ctx.lineTo(hx - 24, hy + 3);
        ctx.moveTo(hx - 34, hy - 4.5);
        ctx.lineTo(hx - 14, hy - 4.5);
        ctx.moveTo(hx + 24, hy - 12);
        ctx.lineTo(hx + 24, hy + 3);
        ctx.moveTo(hx + 14, hy - 4.5);
        ctx.lineTo(hx + 34, hy - 4.5);
        ctx.stroke();
        // Door
        ctx.fillStyle = "#3a2008";
        ctx.fillRect(hx - 10, hy + 8, 20, 22);
        // Door knob
        ctx.fillStyle = "#c8a850";
        ctx.beginPath();
        ctx.arc(hx + 8, hy + 20, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Home zone boundary (dashed)
        const zoneSp = worldToScreen(96, 96, characterX, characterY);
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 200, 0.28)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(zoneSp.x, zoneSp.y, 192, 192);
        ctx.setLineDash([]);
        ctx.restore();
    }

    advanceDay() {
        this.day++;

        let grewCount = 0;
        let thirstyCount = 0;

        this.cropData.forEach((crop) => {
            const cropResult = crop.advanceDay();

            if (cropResult.grew) {
                grewCount++;
            }

            if (!cropResult.wateredToday && !crop.isReadyToHarvest()) {
                thirstyCount++;
            }
        });

        // Trees and rocks regrow overnight
        this.trees.forEach((tree) => tree.regrow());
        this.rocks.forEach((rock) => rock.regrow());

        return {
            day: this.day,
            cropCount: this.cropData.size,
            grewCount,
            thirstyCount
        };
    }

    draw(ctx, characterX, characterY, highlightedTile = null) {
        this.tiles.forEach((tile) => {
            tile.draw(ctx, characterX, characterY);
        });

        this.drawHomeArea(ctx, characterX, characterY);

        this.buildings.forEach((building) => {
            building.draw(ctx, characterX, characterY);
            if (building.isNearby(characterX, characterY)) {
                const sp = worldToScreen(building.x, building.y, characterX, characterY);
                ctx.save();
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.font = "17px Arial";
                ctx.textAlign = "center";
                ctx.fillText(`${building.label} — press F to interact`, sp.x + 8, sp.y + 76);
                ctx.restore();
            }
        });

        this.rocks.forEach((rock) => rock.draw(ctx, characterX, characterY));
        this.trees.forEach((tree) => tree.draw(ctx, characterX, characterY));

        this.items.forEach((worldItem) => {
            if (worldItem.distanceTo(characterX, characterY) <= 220) {
                worldItem.draw(ctx, characterX, characterY);
            }
        });

        this.drawTileHighlight(ctx, highlightedTile, characterX, characterY);
    }
}
