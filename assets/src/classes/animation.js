window.AnimationHelpers = {
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    lerp(start, end, amount) {
        return start + (end - start) * amount;
    },

    easeOutCubic(value) {
        return 1 - Math.pow(1 - value, 3);
    },

    pulse(progress) {
        return Math.sin(progress * Math.PI);
    },

    fadeElement(element, visible) {
        if (!element) {
            return;
        }

        element.classList.toggle("hidden", !visible);
        element.setAttribute("aria-hidden", String(!visible));
    }
};
