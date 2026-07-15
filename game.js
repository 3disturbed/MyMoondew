const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TOOL_CURSOR_MAP = {
    0: { label: "Hands", cursorClass: "cursor-hand" },
    1: { label: "Hoe", cursorClass: "cursor-hoe" },
    2: { label: "Trowel", cursorClass: "cursor-trowel" },
    3: { label: "Watering Can", cursorClass: "cursor-watering-can" },
    4: { label: "Scythe", cursorClass: "cursor-scythe" },
    5: { label: "Fertilizer", cursorClass: "cursor-fertilizer" },
    6: { label: "Axe", cursorClass: "cursor-axe" },
    7: { label: "Pickaxe", cursorClass: "cursor-pickaxe" },
    8: { label: "Sword", cursorClass: "cursor-sword" },
    9: { label: "Net", cursorClass: "cursor-net" }
};

const TOOL_ENERGY_COSTS = {
    1: 6,
    2: 4,
    3: 3,
    4: 2,
    5: 4,
    6: 7,
    7: 7,
    8: 5,
    9: 3
};

const PLANTABLE_SEED_ITEMS = Object.values(CROP_TYPES).map((cropData) => cropData.seedItem);
const STARTER_ITEMS = [
    createItem("Hoe"),
    createItem("Trowel"),
    createItem("Watering Can"),
    createItem("Scythe"),
    createItem("Wheat Seeds", { quantity: 6 }),
    createItem("Tomato Seeds", { quantity: 4 }),
    createItem("Corn Seeds", { quantity: 4 })
];

const music = new Audio("./assets/audio/music.mp3");
music.loop = true;
music.volume = 0.2;

const logo = new Image();
logo.src = "./assets/images/Logo.png";
const logoA = new Image();
logoA.src = "./assets/images/LogoA.png";
const logoB = new Image();
logoB.src = "./assets/images/LogoB.png";

let canPlay = false;
let paused = false;
let hudMessage = "";
let hudMessageUntil = 0;
let lastFrameTime = null;
let hoveredTile = null;
let hoveredSlotIndex = -1;
let selectedSeedItem = "Wheat Seeds";
let introTick = 0;
let fullscreen = Boolean(document.fullscreenElement);

let character;
let world;
let inventory;
let gameState;
let actionBar;
const particles = new ParticleSystem();
const screenShake = { intensity: 0, x: 0, y: 0 };

const uiManager = new UIManager({
    canvas,
    music,
    onContinue: () => app.resumeGame(),
    onNewGame: () => app.startNewGame(),
    onQuit: () => app.quitToMenu(),
    onToggleFullscreen: () => app.toggleFullscreen()
});

function createSession(loadSave = true) {
    character = new Character(ctx);
    world = new World(1600);
    inventory = new Inventory(12);
    inventory.loadStartingItems(STARTER_ITEMS.map((item) => item.clone()));
    gameState = new GameState();

    if (loadSave) {
        gameState.loadGame(world, character, inventory);
    }

    world.day = gameState.day;
    actionBar = new ActionBar((1920 / 2) - (650 / 2), 1080 - 84, inventory);
    hoveredTile = null;
    hoveredSlotIndex = -1;
    selectedSeedItem = getSelectedSeedItemName() || "Wheat Seeds";
    window.character = character;
    window.world = world;
    window.inventory = inventory;
    window.gameState = gameState;
    window.actionBar = actionBar;
    syncSelectedToolVisuals();
}

function setHudMessage(message, duration = 2200) {
    hudMessage = message;
    hudMessageUntil = Date.now() + duration;
    uiManager.showToast(message);
}

function getHudMessage() {
    return Date.now() < hudMessageUntil ? hudMessage : "";
}

function getSelectedSeedItemName() {
    const availableSeeds = PLANTABLE_SEED_ITEMS.filter((itemName) => inventory.countItem(itemName) > 0);

    if (availableSeeds.length === 0) {
        selectedSeedItem = "";
        return null;
    }

    if (!availableSeeds.includes(selectedSeedItem)) {
        selectedSeedItem = availableSeeds[0];
    }

    return selectedSeedItem;
}

function getSelectedSeedLabel() {
    const seedItemName = getSelectedSeedItemName();
    return seedItemName ? seedItemName.replace(" Seeds", "") : "Out of seeds";
}

function cycleSelectedSeed() {
    const availableSeeds = PLANTABLE_SEED_ITEMS.filter((itemName) => inventory.countItem(itemName) > 0);

    if (availableSeeds.length === 0) {
        setHudMessage("No seeds are available to plant.");
        return;
    }

    const currentSeed = getSelectedSeedItemName();
    const currentIndex = availableSeeds.indexOf(currentSeed);
    selectedSeedItem = availableSeeds[(currentIndex + 1) % availableSeeds.length];
    setHudMessage(`Selected ${getSelectedSeedLabel()} seeds.`);
    syncSelectedToolVisuals();
}

function getLocationLabel() {
    if (gameState.isAtHome(character)) {
        return "Homestead";
    }
    if (character.y < -1600) {
        return "North Field";
    }
    if (character.y > 1600) {
        return "South Meadow";
    }
    if (character.x < -1600) {
        return "West Grove";
    }
    if (character.x > 1600) {
        return "East Orchard";
    }
    return "Fields";
}

function getResourceSummary() {
    const counts = { wood: 0, stone: 0, seeds: 0, crops: 0 };

    inventory.slots.forEach((slotItem) => {
        if (!slotItem) {
            return;
        }
        if (slotItem.name === "Wood") {
            counts.wood += slotItem.quantity;
        } else if (slotItem.name === "Stone") {
            counts.stone += slotItem.quantity;
        } else if (slotItem.type === ITEM_TYPES.SEED) {
            counts.seeds += slotItem.quantity;
        } else if (slotItem.type === ITEM_TYPES.PRODUCE) {
            counts.crops += slotItem.quantity;
        }
    });

    const watered = Array.from(world.cropData.values()).filter((crop) => crop.isWatered()).length;
    return `Wood ${counts.wood} · Stone ${counts.stone} · Seeds ${counts.seeds} · Crops ${counts.crops} · Watered ${watered}`;
}

function updateStatsPanel() {
    uiManager.updateStats({
        time: gameState.formatTime(),
        energy: gameState.energy,
        location: getLocationLabel(),
        resources: getResourceSummary()
    });
}

function syncSelectedToolVisuals() {
    const selectedItem = inventory.getSelectedItem();
    const toolConfig = TOOL_CURSOR_MAP[selectedItem?.mode ?? 0] || TOOL_CURSOR_MAP[0];
    const indicatorText = selectedItem?.name === "Trowel"
        ? `${toolConfig.label} • ${getSelectedSeedLabel()}`
        : (selectedItem?.name || toolConfig.label);

    uiManager.setCursor(toolConfig.cursorClass);
    uiManager.pulseToolIndicator(indicatorText);
}

function drawIntroCard() {
    const pulse = (Math.sin(introTick * 0.025) + 1) / 2;
    ctx.save();
    ctx.drawImage(pulse > 0.5 ? logoB : logoA, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.92;
    ctx.drawImage(logo, (canvas.width / 2) - 230, 140, 460, 230);
    ctx.restore();
}

function drawFarmingHud() {
    const selectedTile = world.getInteractionTile(character, hoveredTile);
    const cropCount = world.cropData.size;
    const wateredCount = Array.from(world.cropData.values()).filter((crop) => crop.isWatered()).length;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(1518, 24, 378, 112);
    ctx.fillStyle = "#ffffff";
    ctx.font = "22px Arial";
    ctx.fillText(`Seed: ${getSelectedSeedLabel()}`, 1538, 58);
    ctx.fillText(`Field: ${world.describeTile(selectedTile)}`, 1538, 88);
    ctx.fillText(`Planted: ${cropCount} • Watered: ${wateredCount}`, 1538, 118);
    ctx.restore();
}

function drawHudMessage() {
    const message = getHudMessage();
    if (!message) {
        return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
    ctx.fillRect(560, 962, 800, 42);
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, 960, 990);
    ctx.restore();
}

function updateHoveredTargets(canvasPoint) {
    const hoveredSlot = actionBar.getSlotAt(canvasPoint.x, canvasPoint.y);
    hoveredSlotIndex = hoveredSlot ? hoveredSlot.index : -1;

    if (hoveredSlot) {
        hoveredTile = null;
        return hoveredSlot;
    }

    const tilePosition = world.screenToWorld(canvasPoint.x, canvasPoint.y, character.x, character.y);
    const tile = world.getTileAt(tilePosition.x, tilePosition.y);
    hoveredTile = world.canInteractWithTile(tile, character) ? tile : null;
    return null;
}

function triggerActionFeedback(action, tile, shake = 1.2) {
    const targetTile = tile || world.getInteractionTile(character, hoveredTile);
    const particleX = targetTile ? targetTile.x : character.x;
    const particleY = targetTile ? targetTile.y : character.y;

    particles.emitForAction(action, particleX, particleY);
    screenShake.intensity = Math.max(screenShake.intensity, shake);
    canvas.classList.add("tool-active");
    window.clearTimeout(triggerActionFeedback.timeoutId);
    triggerActionFeedback.timeoutId = window.setTimeout(() => canvas.classList.remove("tool-active"), 140);
    syncSelectedToolVisuals();
}

function trySpendEnergy(modeToUse) {
    if (gameState.consumeEnergy(TOOL_ENERGY_COSTS[modeToUse] || 1, character)) {
        return true;
    }
    setHudMessage("Too exhausted. Head home and press S to sleep.");
    return false;
}

function useTool(preferredTile = null) {
    if (!canPlay || paused || uiManager.isMenuVisible()) {
        return;
    }

    const selectedItem = inventory.getSelectedItem();
    const targetTile = preferredTile || world.getInteractionTile(character, hoveredTile);

    if (!selectedItem) {
        setHudMessage("Selected slot is empty.");
        return;
    }

    if (selectedItem.name === "Trowel" && hoveredTile && !world.canInteractWithTile(hoveredTile, character)) {
        setHudMessage("Move closer to interact with that tile.");
        return;
    }

    if (selectedItem.type !== ITEM_TYPES.TOOL) {
        setHudMessage(selectedItem.type === ITEM_TYPES.SEED ? "Use the trowel to plant seeds." : `${selectedItem.name} is stored. Press G to drop one.`);
        return;
    }

    let result = null;

    switch (selectedItem.mode) {
        case 1:
            result = targetTile ? world.tillTile(targetTile, true) : { success: false, message: "Move closer to the field." };
            if (result.success && trySpendEnergy(selectedItem.mode)) {
                world.tillTile(targetTile);
                character.triggerToolAnimation();
                triggerActionFeedback("planting", targetTile, 1.2);
            }
            break;
        case 2: {
            const seedItemName = getSelectedSeedItemName();
            if (!seedItemName) {
                result = { success: false, message: "You need seeds before using the trowel." };
                break;
            }
            const cropType = Object.keys(CROP_TYPES).find((cropName) => CROP_TYPES[cropName].seedItem === seedItemName);
            result = targetTile ? world.plantCrop(targetTile, cropType, true) : { success: false, message: "Move closer to plant there." };
            if (result.success && trySpendEnergy(selectedItem.mode)) {
                world.plantCrop(targetTile, cropType);
                inventory.removeByName(seedItemName, 1);
                character.triggerToolAnimation();
                triggerActionFeedback("planting", targetTile, 1);
            }
            break;
        }
        case 3:
            result = targetTile ? world.waterCrop(targetTile, true) : { success: false, message: "Move closer to water that tile." };
            if (result.success && trySpendEnergy(selectedItem.mode)) {
                world.waterCrop(targetTile);
                character.triggerToolAnimation();
                triggerActionFeedback("watering", targetTile, 0.8);
            }
            break;
        case 4:
            result = targetTile ? world.harvestCrop(targetTile, true) : { success: false, message: "Move closer to harvest that crop." };
            if (result.success && trySpendEnergy(selectedItem.mode)) {
                const harvestResult = world.harvestCrop(targetTile);
                const addResult = inventory.addItem(createItem(harvestResult.produceItem));
                if (addResult.remaining > 0) {
                    world.spawnDroppedItem(createItem(harvestResult.produceItem, { quantity: addResult.remaining }), character.x, character.y);
                    harvestResult.message += " Inventory full, so the crop fell to the ground.";
                }
                result = harvestResult;
                character.triggerToolAnimation();
                triggerActionFeedback("harvest", targetTile, 1.4);
            }
            break;
        case 5:
            if (!targetTile || !targetTile.crop || targetTile.crop.isReadyToHarvest()) {
                result = { success: false, message: "Fertilizer helps a crop that is still growing." };
                break;
            }
            if (trySpendEnergy(selectedItem.mode)) {
                targetTile.crop.stage = Math.min(targetTile.crop.stage + 1, CROP_STAGE_NAMES.length - 1);
                character.triggerToolAnimation();
                triggerActionFeedback("planting", targetTile, 0.9);
                result = { success: true, message: "The crop perked up after fertilizing." };
            }
            break;
        case 6:
            if (trySpendEnergy(selectedItem.mode)) {
                world.addItemToInventoryOrWorld(inventory, createItem("Wood"), character.x, character.y);
                character.triggerToolAnimation();
                triggerActionFeedback("harvest", targetTile, 2.4);
                result = { success: true, message: "Chopped some wood." };
            }
            break;
        case 7:
            if (trySpendEnergy(selectedItem.mode)) {
                world.addItemToInventoryOrWorld(inventory, createItem("Stone"), character.x, character.y);
                character.triggerToolAnimation();
                triggerActionFeedback("harvest", targetTile, 2.6);
                result = { success: true, message: "Broke off a piece of stone." };
            }
            break;
        case 8:
            if (trySpendEnergy(selectedItem.mode)) {
                character.triggerToolAnimation();
                triggerActionFeedback("default", targetTile, 1.5);
                result = { success: true, message: "Practiced a sword swing." };
            }
            break;
        case 9:
            if (trySpendEnergy(selectedItem.mode)) {
                character.triggerToolAnimation();
                triggerActionFeedback("default", targetTile, 1.2);
                result = { success: true, message: "The net came back empty this time." };
            }
            break;
        default:
            result = { success: false, message: `Using ${selectedItem.name}.` };
            break;
    }

    if (result?.message) {
        setHudMessage(result.message);
    }
    if (result?.success) {
        gameState.saveGame(world, character, inventory);
    }
    updateStatsPanel();
}

function updateScreenShake() {
    if (screenShake.intensity <= 0.05) {
        screenShake.intensity = 0;
        screenShake.x = 0;
        screenShake.y = 0;
        return;
    }

    screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
    screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
    screenShake.intensity *= 0.82;
}

function drawGameFrame(deltaMs) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#132214";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!canPlay) {
        drawIntroCard();
        return;
    }

    if (!paused && !uiManager.isMenuVisible()) {
        character.update();
        gameState.update(deltaMs, world, character, inventory);
        world.day = gameState.day;
    }

    updateScreenShake();

    ctx.save();
    ctx.translate(screenShake.x, screenShake.y);
    world.draw(ctx, character.x, character.y, world.getInteractionTile(character, hoveredTile));
    particles.updateAndDraw(ctx, character.x, character.y);
    character.draw();
    ctx.restore();

    gameState.drawNightOverlay(ctx, canvas.width, canvas.height);
    drawFarmingHud();
    actionBar.draw(ctx, inventory.selectedIndex, hoveredSlotIndex);
    drawHudMessage();
    updateStatsPanel();
}

function gameLoop(timestamp) {
    const now = timestamp || performance.now();
    if (lastFrameTime === null) {
        lastFrameTime = now;
    }

    const deltaMs = now - lastFrameTime;
    lastFrameTime = now;
    introTick += 1;

    drawGameFrame(deltaMs);
    requestAnimationFrame(gameLoop);
}

const app = {
    isInputBlocked() {
        return !canPlay || paused || uiManager.isMenuVisible();
    },

    async ensureAudio() {
        if (!music.paused) {
            return;
        }
        try {
            await music.play();
        } catch (error) {
            console.warn("Audio playback is waiting for a user gesture.", error);
        }
    },

    async resumeGame() {
        if (!canPlay) {
            await this.startSavedGame();
            return;
        }
        paused = false;
        uiManager.hideMenus();
        await this.ensureAudio();
    },

    async startSavedGame() {
        await uiManager.transition(async () => {
            createSession(true);
            canPlay = true;
            paused = false;
            uiManager.hideMenus();
            await this.ensureAudio();
            setHudMessage("Hoe the soil, plant with the trowel, water daily, and harvest with the scythe.", 3200);
        });
    },

    async startNewGame() {
        await uiManager.transition(async () => {
            localStorage.removeItem("mymoondew-save");
            createSession(false);
            canPlay = true;
            paused = false;
            uiManager.hideMenus();
            await this.ensureAudio();
            setHudMessage("A new day starts at 06:00. Gather the starter drops around home to expand your farm.", 3600);
        });
    },

    async quitToMenu() {
        paused = true;
        character.vx = 0;
        character.vy = 0;
        uiManager.showMainMenu(canPlay || Boolean(localStorage.getItem("mymoondew-save")));
    },

    togglePause() {
        if (!canPlay) {
            return;
        }
        if (!document.getElementById("menuOverlay").classList.contains("hidden")) {
            return;
        }
        paused = !paused;
        if (paused) {
            character.vx = 0;
            character.vy = 0;
            uiManager.showPauseMenu();
        } else {
            uiManager.hideMenus();
        }
    },

    async toggleFullscreen() {
        if (!document.fullscreenElement) {
            await canvas.requestFullscreen?.();
            fullscreen = true;
        } else {
            await document.exitFullscreen?.();
            fullscreen = false;
        }
        uiManager.updateFullscreenState();
    },

    selectInventorySlot(index) {
        if (inventory.selectSlot(index)) {
            syncSelectedToolVisuals();
        }
    },

    selectNextSlot(direction) {
        inventory.selectNext(direction);
        syncSelectedToolVisuals();
    },

    dropSelectedItem() {
        if (this.isInputBlocked()) {
            return;
        }
        const dropped = inventory.dropSelected(world, character);
        if (dropped) {
            setHudMessage(`Dropped ${dropped.name}.`);
            gameState.saveGame(world, character, inventory);
        }
    },

    handlePointerMove(event) {
        const rect = canvas.getBoundingClientRect();
        const point = {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height)
        };
        const hoveredSlot = updateHoveredTargets(point);
        const tooltipTarget = event.target.closest("[data-tooltip]");

        if (tooltipTarget) {
            uiManager.showTooltip(tooltipTarget.dataset.tooltip, event.clientX, event.clientY);
            return;
        }

        if (hoveredSlot) {
            const content = hoveredSlot.item
                ? `<strong>${hoveredSlot.item.name}</strong><br>${hoveredSlot.item.description || hoveredSlot.item.type}`
                : `<strong>Empty slot ${hoveredSlot.index + 1}</strong><br>Store tools, seeds, or harvested goods here.`;
            uiManager.showTooltip(content, event.clientX, event.clientY);
            return;
        }

        if (hoveredTile) {
            uiManager.showTooltip(`<strong>${world.describeTile(hoveredTile)}</strong><br>Click or press F to use the selected tool.`, event.clientX, event.clientY);
            return;
        }

        uiManager.hideTooltip();
    },

    handlePointerClick(event) {
        if (event.target.closest("button, input")) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const point = {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height)
        };
        const hoveredSlot = updateHoveredTargets(point);

        if (!canPlay) {
            return;
        }

        if (!document.getElementById("menuOverlay").classList.contains("hidden") || !document.getElementById("pauseOverlay").classList.contains("hidden")) {
            return;
        }

        if (hoveredSlot) {
            inventory.selectSlot(hoveredSlot.index);
            syncSelectedToolVisuals();
            return;
        }

        const pickupResult = world.pickupAtScreenPosition(point.x, point.y, character, inventory);
        if (pickupResult && pickupResult.handled) {
            setHudMessage(pickupResult.message);
            syncSelectedToolVisuals();
            if (pickupResult.success) {
                gameState.saveGame(world, character, inventory);
            }
            return;
        }

        useTool(hoveredTile);
    }
};

window.app = app;
window.useTool = useTool;
window.cycleSelectedSeed = cycleSelectedSeed;

createSession(true);
uiManager.showMainMenu(Boolean(localStorage.getItem(gameState.saveKey)));
updateStatsPanel();
gameLoop();
