/**
 * Custom input element that provides enhanced input functionality.
 * Consists of a root element that contains a label and value.
 */
class InputRoot extends HTMLElement {
    /**
     * Initialize the input root element
     */
    constructor() {
        super();
    }

    #previouseChangeValue = "";

    get value() {
        const valueElement = /** @type {InputValue} */ (
            this.querySelector("input-value")
        );

        if (!valueElement) return "";
        return valueElement.value;
    }

    get name() {
        return this.getAttribute("name") ?? "";
    }

    /**
     * Called when the element is connected to the DOM
     */
    connectedCallback() {
        this.addEventListener("input-input", this.#handleInput);
        this.addEventListener("keydown", this.#handleKeyDown);
        this.addEventListener("focusout", this.#handleBlur);

        const inputValueElement = this.querySelector("input-value");
        if (inputValueElement) {
            this.#previouseChangeValue = inputValueElement.textContent;
        }
    }

    /**
     * Called when the element is disconnected from the DOM
     */
    disconnectedCallback() {
        this.removeEventListener("input-input", this.#handleInput);
    }

    /**
     * Handle keydown events to prevent newlines
     * @param {KeyboardEvent} event - The keyboard event
     */
    #handleKeyDown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            if (this.value !== this.#previouseChangeValue) {
                this.#previouseChangeValue = this.value;
                this.dispatchEvent(new Event("change", { bubbles: true }));
            }
        }
    }

    /**
     * Handle blur events to dispatch change events
     */
    #handleBlur() {
        if (this.value !== this.#previouseChangeValue) {
            this.#previouseChangeValue = this.value;
            this.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }

    /**
     * Handle input events from the input element
     * @param {Event} event - The input event
     */
    #handleInput(event) {
        event.stopPropagation();

        this.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

/**
 * Label element for the input
 */
class InputLabel extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.addEventListener("click", this.#handleClick);
    }

    disconnectedCallback() {
        this.removeEventListener("click", this.#handleClick);
    }

    /**
     * Handle click events on the label
     */
    #handleClick() {
        const root = this.closest("input-root");
        const valueElement = /** @type {InputValue} */ (
            root?.querySelector("input-value")
        );
        valueElement?.focus();
    }
}

/**
 * Value container element for the input
 */
class InputValue extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.setAttribute("contenteditable", "true");

        this.addEventListener("input", this.#handleInput);
        this.addEventListener("keydown", this.#handleKeyDown);
    }

    disconnectedCallback() {
        this.removeEventListener("input", this.#handleInput);
        this.removeEventListener("keydown", this.#handleKeyDown);
    }

    /**
     * Handle keydown events to prevent newlines
     * @param {KeyboardEvent} event - The keyboard event
     */
    #handleKeyDown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    }

    /**
     * Handle input events from the input element
     * @param {InputEvent} event - The input event
     */
    #handleInput(event) {
        event.stopPropagation();

        // Remove any newlines that might have been pasted
        if (this.textContent?.includes("\n")) {
            this.textContent = this.textContent.replace(/\n/g, "");
        }

        this.dispatchEvent(
            new CustomEvent("input-input", {
                bubbles: true,
                detail: { value: event.data },
            })
        );
    }

    get value() {
        return this.textContent;
    }
}

// Register the custom elements
customElements.define("input-root", InputRoot);
customElements.define("input-label", InputLabel);
customElements.define("input-value", InputValue);
