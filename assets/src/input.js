function updateMovementKey(key, isPressed) {
    switch (key) {
        case "shift":
            character.sprint = isPressed;
            break;
        case "w":
            if (isPressed) {
                character.setDirection("up");
                character.vy = character.speed;
            } else if (character.vy > 0) {
                character.vy = 0;
            }
            break;
        case "a":
            if (isPressed) {
                character.setDirection("left");
                character.vx = -character.speed;
            } else if (character.vx < 0) {
                character.vx = 0;
            }
            break;
        case "s":
            if (isPressed) {
                character.setDirection("down");
                character.vy = -character.speed;
            } else if (character.vy < 0) {
                character.vy = 0;
            }
            break;
        case "d":
            if (isPressed) {
                character.setDirection("right");
                character.vx = character.speed;
            } else if (character.vx > 0) {
                character.vx = 0;
            }
            break;
        default:
            break;
    }
}

function selectInventoryFromKey(key) {
    const slotMap = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "5": 4,
        "6": 5,
        "7": 6,
        "8": 7,
        "9": 8,
        "0": 9,
        "-": 10,
        "=": 11
    };

    if (!(key in slotMap) || !window.app) {
        return false;
    }

    window.app.selectInventorySlot(slotMap[key]);
    return true;
}

document.addEventListener("keydown", (event) => {
    if (event.key === "S") {
        event.preventDefault();
        if (!gameState.attemptSleep(world, character, inventory)) {
            setHudMessage("You can only sleep while standing inside the home square.");
        }
        return;
    }

    const key = event.key.toLowerCase();

    if (key === "p") {
        event.preventDefault();
        window.app?.togglePause();
        return;
    }

    if (!window.app || window.app.isInputBlocked()) {
        return;
    }

    if (selectInventoryFromKey(key)) {
        return;
    }

    switch (key) {
        case "q":
            window.app.selectNextSlot(-1);
            break;
        case "e":
            window.app.selectNextSlot(1);
            break;
        case "f":
            useTool();
            break;
        case "g":
            window.app.dropSelectedItem();
            break;
        case "r":
            cycleSelectedSeed();
            break;
        case "n":
            gameState.endDay(world, character, inventory, "You turned in for the night and your crops pushed onward.");
            break;
        default:
            updateMovementKey(key, true);
            break;
    }
});

document.addEventListener("keyup", (event) => {
    updateMovementKey(event.key.toLowerCase(), false);
});

document.addEventListener("mousemove", (event) => {
    window.app?.handlePointerMove(event);
});

document.addEventListener("click", (event) => {
    window.app?.handlePointerClick(event);
});
