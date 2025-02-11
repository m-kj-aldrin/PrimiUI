/**
 * Value container element for the input
 */
class InputValue extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.setAttribute("contenteditable", "true");
        this.setAttribute("role", "textbox");
        this.setAttribute("aria-multiline", "false");

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

// Register the custom element
customElements.define("input-value", InputValue);

export { InputValue }; 