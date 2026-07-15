class UIManager {
    constructor({ canvas, music, onContinue, onNewGame, onQuit, onToggleFullscreen }) {
        this.canvas = canvas;
        this.music = music;
        this.onToggleFullscreen = onToggleFullscreen;
        this.toastTimer = null;

        this.fullscreenButton = document.getElementById("fullscreenToggle");
        this.transitionOverlay = document.getElementById("transitionOverlay");
        this.tooltip = document.getElementById("tooltip");
        this.toast = document.getElementById("toast");
        this.toolIndicator = document.getElementById("toolIndicator");
        this.startHint = document.getElementById("startHint");
        this.stats = {
            time: document.getElementById("statTime"),
            energy: document.getElementById("statEnergy"),
            location: document.getElementById("statLocation"),
            resources: document.getElementById("statResources")
        };

        this.mainMenu = new PauseMenu(document.getElementById("menuOverlay"), {
            continue: onContinue,
            new: onNewGame,
            quit: onQuit
        });
        this.pauseMenu = new PauseMenu(document.getElementById("pauseOverlay"), {
            continue: onContinue,
            new: onNewGame,
            quit: onQuit
        });

        this.volumeInputs = [
            document.getElementById("volumeControl"),
            document.getElementById("pauseVolumeControl")
        ].filter(Boolean);
        this.settingsFullscreenButtons = [
            document.getElementById("settingsFullscreen"),
            document.getElementById("pauseSettingsFullscreen")
        ].filter(Boolean);

        this.fullscreenButton.addEventListener("click", () => this.onToggleFullscreen());
        this.settingsFullscreenButtons.forEach((button) => {
            button.addEventListener("click", () => this.onToggleFullscreen());
        });
        this.volumeInputs.forEach((input) => {
            input.value = Math.round(this.music.volume * 100);
            input.addEventListener("input", () => {
                const volume = Number(input.value) / 100;
                this.music.volume = volume;
                this.volumeInputs.forEach((candidate) => {
                    if (candidate !== input) {
                        candidate.value = input.value;
                    }
                });
                this.showToast(`Music volume ${input.value}%`);
            });
        });

        document.addEventListener("fullscreenchange", () => this.updateFullscreenState());
        this.updateFullscreenState();
    }

    showMainMenu(canContinue) {
        this.mainMenu.setButtonDisabled("continue", !canContinue);
        this.mainMenu.toggleSettings(false);
        this.pauseMenu.setVisible(false);
        this.mainMenu.setVisible(true);
        this.startHint.classList.remove("hidden");
    }

    showPauseMenu() {
        this.pauseMenu.toggleSettings(false);
        this.pauseMenu.setVisible(true);
    }

    hideMenus() {
        this.mainMenu.setVisible(false);
        this.pauseMenu.setVisible(false);
        this.startHint.classList.add("hidden");
    }

    isMenuVisible() {
        return !document.getElementById("menuOverlay").classList.contains("hidden") ||
            !document.getElementById("pauseOverlay").classList.contains("hidden");
    }

    setCursor(toolClass) {
        this.canvas.className = toolClass ? toolClass : "";
    }

    pulseToolIndicator(label) {
        this.toolIndicator.textContent = label;
        this.toolIndicator.classList.add("active");
        window.clearTimeout(this.toolPulseTimer);
        this.toolPulseTimer = window.setTimeout(() => {
            this.toolIndicator.classList.remove("active");
        }, 220);
    }

    updateStats(stats) {
        this.stats.time.textContent = stats.time;
        this.stats.energy.textContent = `${stats.energy}%`;
        this.stats.location.textContent = stats.location;
        this.stats.resources.textContent = stats.resources;
    }

    showTooltip(content, x, y) {
        if (!content) {
            this.hideTooltip();
            return;
        }

        this.tooltip.innerHTML = content;
        this.tooltip.classList.remove("hidden");
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
    }

    hideTooltip() {
        this.tooltip.classList.add("hidden");
    }

    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.remove("hidden");
        window.clearTimeout(this.toastTimer);
        this.toastTimer = window.setTimeout(() => {
            this.toast.classList.add("hidden");
        }, 1800);
    }

    async transition(callback) {
        this.transitionOverlay.classList.add("active");
        await new Promise((resolve) => window.setTimeout(resolve, 180));
        if (typeof callback === "function") {
            await callback();
        }
        await new Promise((resolve) => window.setTimeout(resolve, 120));
        this.transitionOverlay.classList.remove("active");
    }

    updateFullscreenState() {
        const active = Boolean(document.fullscreenElement);
        this.fullscreenButton.textContent = active ? "🡽" : "⛶";
        this.fullscreenButton.dataset.tooltip = active ? "Exit fullscreen" : "Enter fullscreen";
        this.settingsFullscreenButtons.forEach((button) => {
            button.textContent = active ? "Exit Fullscreen" : "Enter Fullscreen";
        });
    }
}
