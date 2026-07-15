const ITEM_TYPES = {
    SEED: "seed",
    TOOL: "tool",
    RESOURCE: "resource",
    PRODUCE: "produce"
};

const ITEM_LIBRARY = {
    "Hoe": {name: "Hoe", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/Hoe.png", mode: 1, description: "Turn grass and dirt into soft soil."},
    "Trowel": {name: "Trowel", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/Trowel.png", mode: 2, description: "Plant seeds into prepared soil."},
    "Watering Can": {name: "Watering Can", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/WateringCan.png", mode: 3, description: "Water planted crops to help them grow."},
    "Scythe": {name: "Scythe", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/Sythe.png", mode: 4, description: "Harvest mature crops in one clean sweep."},
    "Fertilizer Bucket": {name: "Fertilizer Bucket", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/Fert.png", mode: 5, description: "Boost a planted crop's growth."},
    "Axe": {name: "Axe", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/Axe.png", mode: 6, description: "Gather wood from wild debris."},
    "Pickaxe": {name: "Pickaxe", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/PickAxe.png", mode: 7, description: "Break rocks and collect stone."},
    "Sword": {name: "Sword", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/Sword.png", mode: 8, description: "Practice a quick swing."},
    "Net": {name: "Net", type: ITEM_TYPES.TOOL, maxStack: 1, icon: "./assets/images/Net.png", mode: 9, description: "Catch tiny wandering critters."},
    "Parsnip Seeds": {name: "Parsnip Seeds", type: ITEM_TYPES.SEED, maxStack: 25, icon: null, color: "#f3d36b", description: "Basic spring seeds for your first field."},
    "Wheat Seeds": {name: "Wheat Seeds", type: ITEM_TYPES.SEED, maxStack: 25, icon: null, color: "#d7b14f", description: "Hardy grain seeds that mature quickly."},
    "Tomato Seeds": {name: "Tomato Seeds", type: ITEM_TYPES.SEED, maxStack: 25, icon: null, color: "#d96055", description: "Juicy vine seeds that love daily water."},
    "Corn Seeds": {name: "Corn Seeds", type: ITEM_TYPES.SEED, maxStack: 25, icon: null, color: "#e9cd4b", description: "Tall summer seeds with a bright yellow harvest."},
    "Parsnip": {name: "Parsnip", type: ITEM_TYPES.PRODUCE, maxStack: 25, icon: null, color: "#e6d8b8", description: "A fresh harvest ready to store."},
    "Wheat": {name: "Wheat", type: ITEM_TYPES.PRODUCE, maxStack: 25, icon: null, color: "#d8bc63", description: "Golden wheat harvested from a ripe stalk."},
    "Tomato": {name: "Tomato", type: ITEM_TYPES.PRODUCE, maxStack: 25, icon: null, color: "#de6558", description: "A ripe tomato picked at peak freshness."},
    "Corn": {name: "Corn", type: ITEM_TYPES.PRODUCE, maxStack: 25, icon: null, color: "#efcf58", description: "A sweet ear of corn ready for storage."},
    "Wood": {name: "Wood", type: ITEM_TYPES.RESOURCE, maxStack: 50, icon: null, color: "#8b5a2b", description: "A basic crafting resource."},
    "Stone": {name: "Stone", type: ITEM_TYPES.RESOURCE, maxStack: 50, icon: null, color: "#8f9aa3", description: "A basic building resource."}
};

class Item {
    constructor ({name, type, quantity = 1, maxStack = 1, icon = null, color = "#d8d8d8", mode = 0, description = ""}) {
        this.name = name;
        this.type = type;
        this.quantity = quantity;
        this.maxStack = maxStack;
        this.icon = icon;
        this.color = color;
        this.mode = mode;
        this.description = description;
        this.iconImage = null;

        if (this.icon) {
            this.iconImage = new Image();
            this.iconImage.src = this.icon;
        }
    }

    clone (quantity = this.quantity) {
        return new Item({
            name: this.name,
            type: this.type,
            quantity,
            maxStack: this.maxStack,
            icon: this.icon,
            color: this.color,
            mode: this.mode,
            description: this.description
        });
    }

    canStackWith (otherItem) {
        return !!otherItem && this.name === otherItem.name && this.type === otherItem.type && this.maxStack > 1;
    }

    drawIcon (ctx, x, y, size) {
        if (this.iconImage && this.iconImage.complete) {
            ctx.drawImage(this.iconImage, x, y, size, size);
            return;
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = "#1c1c1c";
        ctx.font = `${Math.max(12, Math.floor(size / 2.6))}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.name.charAt(0), x + (size / 2), y + (size / 2));
    }
}

function createItem (name, overrides = {}) {
    const itemDefinition = ITEM_LIBRARY[name];

    if (!itemDefinition) {
        throw new Error(`Unknown item: ${name}`);
    }

    return new Item({...itemDefinition, ...overrides});
}
