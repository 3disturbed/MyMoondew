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
    }
};

const tileImageLibrary = {
    grass: createWorldImage("Grass.png"),
    dirt: createWorldImage("Dirt.png"),
    stone: createWorldImage("Dirt.png"),
    tilled: createWorldImage("Plowed.png")
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
        ctx.drawImage(this.getTileImage(), screenPosition.x, screenPosition.y, TILE_SIZE, TILE_SIZE);

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
        this.day = 1;

        for (let x = -200; x < 200; x++) {
            for (let y = -200; y < 200; y++) {
                const tileType = x % 2 === 1 ? "grass" : "dirt";
                const tile = new Tile(x * TILE_SIZE, y * TILE_SIZE, tileType, false, drawDis);
                this.tiles.push(tile);
                this.tileMap.set(this.getTileKey(tile.x, tile.y), tile);
            }
        }

        this.seedStarterItems();
    }

    getTileKey(x, y) {
        return `${x},${y}`;
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
        this.spawnDroppedItem(createItem("Wood", {quantity: 12}), 96, -32);
        this.spawnDroppedItem(createItem("Stone", {quantity: 10}), -32, 96);
        this.spawnDroppedItem(createItem("Axe"), 96, 96);
        this.spawnDroppedItem(createItem("Pickaxe"), -96, 96);
    }

    spawnDroppedItem(item, x, y) {
        this.items.push(new WorldItem(item, x, y));
    }

    serializeDroppedItems() {
        return this.items.map((worldItem) => ({
            x: worldItem.x,
            y: worldItem.y,
            item: {
                name: worldItem.item.name,
                quantity: worldItem.item.quantity
            }
        }));
    }

    loadDroppedItems(savedItems) {
        this.items = [];

        (savedItems || []).forEach((savedItem) => {
            this.spawnDroppedItem(createItem(savedItem.item.name, {quantity: savedItem.item.quantity}), savedItem.x, savedItem.y);
        });
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

        if (tile.type === "stone") {
            return {success: false, message: "That tile cannot be tilled."};
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
            "Corn Seeds": "corn"
        };

        for (const [itemName, cropType] of Object.entries(seedMap)) {
            if (inventory.countItem(itemName) > 0) {
                return {itemName, cropType};
            }
        }

        return null;
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

        return {
            day: this.day,
            cropCount: this.cropData.size,
            grewCount,
            thirstyCount
        };
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

    serializeDroppedItems() {
        return this.items.map((worldItem) => ({
            name: worldItem.item.name,
            quantity: worldItem.item.quantity,
            x: worldItem.x,
            y: worldItem.y
        }));
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
        this.seedStarterItems();
    }

    getLocationName(x, y) {
        if (Math.abs(x) <= 128 && Math.abs(y) <= 128) {
            return "Homestead";
        }

        if (y < -640) {
            return "North Field";
        }

        if (y > 640) {
            return "South Field";
        }

        return x < 0 ? "West Plot" : "East Plot";
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

    loadDroppedItems(savedItems) {
        this.items = [];

        savedItems.forEach((savedItem) => {
            if (!savedItem?.item?.name) {
                return;
            }

            this.spawnDroppedItem(
                createItem(savedItem.item.name, {quantity: savedItem.item.quantity || 1}),
                savedItem.x || 0,
                savedItem.y || 0
            );
        });
    }

    loadDroppedItems(droppedItems) {
        this.items = [];

        droppedItems.forEach((droppedItem) => {
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
        const topLeft = worldToScreen(112, 112, characterX, characterY);
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 3;
        ctx.strokeRect(topLeft.x - 112, topLeft.y - 112, 112, 112);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(topLeft.x - 112, topLeft.y - 112, 112, 112);
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Arial";
        ctx.fillText("Home", topLeft.x - 86, topLeft.y - 50);
        ctx.restore();
    }

    draw(ctx, characterX, characterY, highlightedTile = null) {
        this.tiles.forEach((tile) => {
            tile.draw(ctx, characterX, characterY);
        });

        this.drawHomeArea(ctx, characterX, characterY);

        this.items.forEach((worldItem) => {
            if (worldItem.distanceTo(characterX, characterY) <= 220) {
                worldItem.draw(ctx, characterX, characterY);
            }
        });

        this.drawTileHighlight(ctx, highlightedTile, characterX, characterY);
    }
}
