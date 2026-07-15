class GameState {
    constructor() {
        this.day = 1;
        this.currentMinutes = 6 * 60;
        this.dayStartMinutes = 6 * 60;
        this.dayEndMinutes = 26 * 60;
        this.msPerGameMinute = 1000;
        this.maxEnergy = 100;
        this.energy = this.maxEnergy;
        this.lowEnergyThreshold = 25;
        this.saveKey = "mymoondew-save";
        this.timeAccumulator = 0;
        this.lastSleepReason = "";
    }

    update(deltaMs, world, character, inventory) {
        this.timeAccumulator += deltaMs;

        while (this.timeAccumulator >= this.msPerGameMinute) {
            this.currentMinutes++;
            this.timeAccumulator -= this.msPerGameMinute;

            if (this.currentMinutes >= this.dayEndMinutes) {
                this.endDay(world, character, inventory, "It got too late, so you headed to bed.");
                break;
            }
        }

        this.syncCharacter(character);
        this.updateStatsPanel(character, inventory);
    }

    syncCharacter(character) {
        character.setEnergy(this.energy, this.maxEnergy);
    }

    consumeEnergy(amount, character) {
        if (this.energy < amount) {
            this.syncCharacter(character);
            return false;
        }

        this.energy = Math.max(0, this.energy - amount);
        this.syncCharacter(character);
        return true;
    }

    isLowEnergy() {
        return this.energy <= this.lowEnergyThreshold;
    }

    isAtHome(character) {
        return Math.abs(character.x) <= 96 && Math.abs(character.y) <= 96;
    }

    attemptSleep(world, character, inventory) {
        if (!this.isAtHome(character)) {
            return false;
        }

        this.endDay(world, character, inventory, "You slept through the night and woke up refreshed.");
        return true;
    }

    endDay(world, character, inventory, reason) {
        world.advanceDay();
        this.day++;
        this.currentMinutes = this.dayStartMinutes;
        this.timeAccumulator = 0;
        this.energy = this.maxEnergy;
        this.lastSleepReason = reason;
        character.x = 0;
        character.y = 0;
        character.vx = 0;
        character.vy = 0;
        this.syncCharacter(character);
        this.saveGame(world, character, inventory);

        if (typeof setHudMessage === "function") {
            setHudMessage(reason, 2800);
        }
    }

    saveGame(world, character, inventory) {
        const payload = {
            day: this.day,
            currentMinutes: this.currentMinutes,
            energy: this.energy,
            character: {
                x: character.x,
                y: character.y
            },
            farmTiles: world.serializeFarmState(),
            droppedItems: world.serializeDroppedItems(),
            inventory: inventory.serialize()
        };

        localStorage.setItem(this.saveKey, JSON.stringify(payload));
    }

    loadGame(world, character, inventory) {
        const rawSave = localStorage.getItem(this.saveKey);

        if (!rawSave) {
            this.syncCharacter(character);
            return;
        }

        try {
            const saveData = JSON.parse(rawSave);
            this.day = saveData.day ?? this.day;
            this.currentMinutes = saveData.currentMinutes ?? this.currentMinutes;
            this.energy = saveData.energy ?? this.maxEnergy;

            if (saveData.character) {
                character.x = saveData.character.x ?? 0;
                character.y = saveData.character.y ?? 0;
            }

            world.day = this.day;
            world.loadFarmState(saveData.farmTiles || []);
            world.loadDroppedItems(saveData.droppedItems || []);
            inventory.loadState(saveData.inventory);
        } catch (error) {
            console.warn("Unable to load save data.", error);
        }

        this.syncCharacter(character);
    }

    formatTime() {
        const normalizedMinutes = this.currentMinutes % (24 * 60);
        const hours = Math.floor(normalizedMinutes / 60);
        const minutes = normalizedMinutes % 60;
        const paddedHours = String(hours).padStart(2, "0");
        const paddedMinutes = String(minutes).padStart(2, "0");

        return `${paddedHours}:${paddedMinutes}`;
    }

    getNightOverlayAlpha() {
        const normalizedMinutes = this.currentMinutes % (24 * 60);
        const hour = normalizedMinutes / 60;

        if (hour >= 6 && hour < 18) {
            return 0;
        }

        if (hour >= 18 && hour < 24) {
            return ((hour - 18) / 6) * 0.55;
        }

        if (hour < 2) {
            return 0.55;
        }

        return ((6 - hour) / 4) * 0.55;
    }

    drawUi(ctx, character) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(24, 24, 300, 122);

        ctx.fillStyle = "#ffffff";
        ctx.font = "28px Arial";
        ctx.fillText(`Day ${this.day}`, 42, 62);
        ctx.fillText(this.formatTime(), 42, 98);

        ctx.font = "22px Arial";
        ctx.fillText("Energy", 42, 130);
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillRect(132, 110, 160, 20);
        ctx.fillStyle = this.isLowEnergy() ? "#f2b134" : "#74c365";
        ctx.fillRect(132, 110, 160 * (this.energy / this.maxEnergy), 20);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(132, 110, 160, 20);

        if (this.isLowEnergy()) {
            ctx.fillStyle = "#f9d976";
            ctx.font = "24px Arial";
            ctx.fillText("Low energy - head home soon.", 24, 190);
        }

        if (this.isAtHome(character)) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "24px Arial";
            ctx.fillText("Press S at home to sleep.", 24, 224);
        }

        ctx.restore();
    }

    updateStatsPanel(character, inventory) {
        const statTime = document.getElementById("statTime");
        const statEnergy = document.getElementById("statEnergy");
        const statLocation = document.getElementById("statLocation");
        const statResources = document.getElementById("statResources");

        if (statTime) {
            statTime.textContent = this.formatTime();
        }

        if (statEnergy) {
            statEnergy.textContent = `${this.energy}%`;
        }

        if (statLocation) {
            statLocation.textContent = this.isAtHome(character) ? "Homestead" : "Fields";
        }

        if (statResources && inventory) {
            const counts = {
                wood: 0,
                stone: 0,
                seeds: 0,
                crops: 0
            };

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

            statResources.textContent = `Wood ${counts.wood} · Stone ${counts.stone} · Seeds ${counts.seeds} · Crops ${counts.crops}`;
        }
    }

    drawNightOverlay(ctx, width, height) {
        const alpha = this.getNightOverlayAlpha();

        if (alpha <= 0) {
            return;
        }

        ctx.save();
        ctx.fillStyle = `rgba(12, 20, 42, ${alpha})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}
