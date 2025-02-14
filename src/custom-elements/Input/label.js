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
        const valueElement = /** @type {import("./TextValue/index").InputValue} */ (
            root?.querySelector("input-value")
        );
        valueElement?.focus();
    }
}

// Register the custom element
customElements.define("input-label", InputLabel);

export { InputLabel }; 