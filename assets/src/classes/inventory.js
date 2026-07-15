class Inventory {
    constructor (size = 12) {
        this.size = size;
        this.slots = Array(size).fill(null);
        this.selectedIndex = 0;
    }

    addItem (itemToAdd) {
        let remainingQuantity = itemToAdd.quantity;

        this.slots.forEach((slotItem) => {
            if (remainingQuantity <= 0 || !slotItem || !slotItem.canStackWith(itemToAdd) || slotItem.quantity >= slotItem.maxStack) {
                return;
            }

            const stackSpace = slotItem.maxStack - slotItem.quantity;
            const movedAmount = Math.min(stackSpace, remainingQuantity);
            slotItem.quantity += movedAmount;
            remainingQuantity -= movedAmount;
        });

        for (let index = 0; index < this.slots.length && remainingQuantity > 0; index++) {
            if (this.slots[index]) {
                continue;
            }

            const movedAmount = Math.min(itemToAdd.maxStack, remainingQuantity);
            this.slots[index] = itemToAdd.clone(movedAmount);
            remainingQuantity -= movedAmount;
        }

        return {
            added: itemToAdd.quantity - remainingQuantity,
            remaining: remainingQuantity
        };
    }

    removeFromSlot (slotIndex, quantity = 1) {
        const slotItem = this.slots[slotIndex];

        if (!slotItem) {
            return null;
        }

        const removedQuantity = Math.min(quantity, slotItem.quantity);
        const removedItem = slotItem.clone(removedQuantity);

        slotItem.quantity -= removedQuantity;

        if (slotItem.quantity <= 0) {
            this.slots[slotIndex] = null;
        }

        return removedItem;
    }

    getSelectedItem () {
        return this.slots[this.selectedIndex];
    }

    getSelectedToolMode () {
        const selectedItem = this.getSelectedItem();
        return selectedItem && selectedItem.type === ITEM_TYPES.TOOL ? selectedItem.mode : 0;
    }

    selectSlot (slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.size) {
            return false;
        }

        this.selectedIndex = slotIndex;
        return true;
    }

    selectNext (direction) {
        this.selectedIndex = (this.selectedIndex + direction + this.size) % this.size;
        return this.selectedIndex;
    }

    dropSelected (world, character) {
        const selectedItem = this.getSelectedItem();

        if (!selectedItem) {
            return null;
        }

        const quantityToDrop = selectedItem.maxStack > 1 ? 1 : selectedItem.quantity;
        const droppedItem = this.removeFromSlot(this.selectedIndex, quantityToDrop);
        const dropPosition = character.getFacingPosition(56);

        world.spawnDroppedItem(droppedItem, dropPosition.x, dropPosition.y);

        return droppedItem;
    }

    loadStartingItems (items) {
        items.forEach((item) => {
            this.addItem(item);
        });
    }

    countItem (itemName) {
        return this.slots.reduce((total, slotItem) => {
            if (!slotItem || slotItem.name !== itemName) {
                return total;
            }

            return total + slotItem.quantity;
        }, 0);
    }

    findFirstItemIndexByName (itemName) {
        return this.slots.findIndex((slotItem) => slotItem && slotItem.name === itemName);
    }

    findFirstToolIndexByMode (toolMode) {
        return this.slots.findIndex((slotItem) => slotItem && slotItem.type === ITEM_TYPES.TOOL && slotItem.mode === toolMode);
    }

    removeByName (itemName, quantity = 1) {
        let remainingQuantity = quantity;

        for (let index = 0; index < this.slots.length && remainingQuantity > 0; index++) {
            const slotItem = this.slots[index];

            if (!slotItem || slotItem.name !== itemName) {
                continue;
            }

            const removedAmount = Math.min(slotItem.quantity, remainingQuantity);
            slotItem.quantity -= removedAmount;
            remainingQuantity -= removedAmount;

            if (slotItem.quantity <= 0) {
                this.slots[index] = null;
            }
        }

        return remainingQuantity === 0;
    }

    serialize () {
        return {
            selectedIndex: this.selectedIndex,
            slots: this.slots.map((slotItem) => {
                if (!slotItem) {
                    return null;
                }

                return {
                    name: slotItem.name,
                    quantity: slotItem.quantity
                };
            })
        };
    }

    loadState (savedState) {
        if (!savedState) {
            return;
        }

        this.selectedIndex = savedState.selectedIndex ?? 0;
        this.slots = Array(this.size).fill(null);

        (savedState.slots || []).forEach((slotItem, index) => {
            if (!slotItem || index >= this.size) {
                return;
            }

            this.slots[index] = createItem(slotItem.name, {quantity: slotItem.quantity});
        });
    }
}
