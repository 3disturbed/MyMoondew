class ActionBarSlot {
    constructor(index, x, y, size) {
        this.index = index;
        this.x = x;
        this.y = y;
        this.size = size;
    }

    contains(canvasX, canvasY) {
        return canvasX >= this.x
            && canvasX <= this.x + this.size
            && canvasY >= this.y
            && canvasY <= this.y + this.size;
    }
}

class ActionBar {
    constructor(x, y, inventory) {
        this.x = x;
        this.y = y;
        this.inventory = inventory;
        this.slotSize = 58;
        this.slotGap = 8;
        this.slots = [];
        this.rebuildSlots();
    }

    rebuildSlots() {
        const totalWidth = (this.inventory.size * this.slotSize) + ((this.inventory.size - 1) * this.slotGap);
        this.x = (1920 / 2) - (totalWidth / 2);
        this.slots = Array.from({ length: this.inventory.size }, (_, index) => {
            const slotX = this.x + (index * (this.slotSize + this.slotGap));
            return new ActionBarSlot(index, slotX, this.y, this.slotSize);
        });
    }

    draw(ctx, selectedIndex, hoveredIndex) {
        this.rebuildSlots();
        const width = (this.inventory.size * this.slotSize) + ((this.inventory.size - 1) * this.slotGap);

        ctx.save();
        ctx.fillStyle = "rgba(7, 14, 8, 0.72)";
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(this.x - 12, this.y - 46, width + 24, 110, 22);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(242, 248, 232, 0.8)";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Inventory • Click world items to pick them up • G drops • F uses • R changes seeds • S sleeps", 1920 / 2, this.y - 18);
        ctx.restore();

        this.slots.forEach((slot) => {
            const slotItem = this.inventory.slots[slot.index];
            const selected = slot.index === selectedIndex;
            const hovered = slot.index === hoveredIndex;

            ctx.save();
            ctx.fillStyle = selected ? "rgba(143, 227, 106, 0.32)" : hovered ? "rgba(255,255,255,0.15)" : "rgba(5, 11, 6, 0.52)";
            ctx.strokeStyle = selected ? "rgba(174, 245, 152, 0.95)" : "rgba(255,255,255,0.12)";
            ctx.lineWidth = selected ? 3 : 1.5;
            ctx.beginPath();
            ctx.roundRect(slot.x, slot.y, slot.size, slot.size, 14);
            ctx.fill();
            ctx.stroke();

            if (slotItem) {
                slotItem.drawIcon(ctx, slot.x + 8, slot.y + 8, slot.size - 16);

                ctx.fillStyle = "#f2f8e8";
                ctx.font = "bold 15px Arial";
                ctx.textAlign = "right";
                ctx.textBaseline = "bottom";
                ctx.fillText(slotItem.quantity > 1 ? String(slotItem.quantity) : "", slot.x + slot.size - 8, slot.y + slot.size - 6);
            }

            ctx.fillStyle = "#f2f8e8";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(this.getSlotLabel(slot.index), slot.x + 8, slot.y + 8);
            ctx.restore();
        });

        const selectedItem = this.inventory.getSelectedItem();
        if (selectedItem) {
            ctx.save();
            ctx.fillStyle = "#f2f8e8";
            ctx.font = "18px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`${selectedItem.name} • ${selectedItem.description || selectedItem.type}`, 1920 / 2, this.y - 40);
            ctx.restore();
        }

    }

    getSlotLabel(index) {
        const labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
        return labels[index] || "";
    }

    getSlotAt(canvasX, canvasY) {
        const slot = this.slots.find((candidate) => candidate.contains(canvasX, canvasY));
        if (!slot) {
            return null;
        }

        return {
            index: slot.index,
            item: this.inventory.slots[slot.index] || null
        };
    }
}
