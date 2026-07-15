class PauseMenu {
    constructor(root, callbacks = {}) {
        this.root = root;
        this.callbacks = callbacks;
        this.settingsPanel = root.querySelector("[data-settings-panel]");
        this.buttons = Array.from(root.querySelectorAll("[data-menu-action]"));

        this.buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.menuAction;
                if (action === "settings") {
                    this.toggleSettings();
                    return;
                }

                const handler = this.callbacks[action];
                if (typeof handler === "function") {
                    handler();
                }
            });
        });
    }

    setVisible(visible) {
        AnimationHelpers.fadeElement(this.root, visible);
    }

    toggleSettings(force) {
        const shouldShow = typeof force === "boolean" ? force : this.settingsPanel.classList.contains("hidden");
        this.settingsPanel.classList.toggle("hidden", !shouldShow);
    }

    setButtonDisabled(action, disabled) {
        const button = this.buttons.find((candidate) => candidate.dataset.menuAction === action);
        if (button) {
            button.disabled = disabled;
        }
    }
}
