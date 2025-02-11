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
        const valueElement = /** @type {import("./value").InputValue} */ (
            this.querySelector("input-value")
        );

        if (!valueElement) return "";
        return valueElement.value;
    }

    get name() {
        return this.getAttribute("x-name") ?? "";
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
        this.removeEventListener("keydown", this.#handleKeyDown);
        this.removeEventListener("focusout", this.#handleBlur);
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

// Register the custom element
customElements.define("input-root", InputRoot);

export { InputRoot }; 