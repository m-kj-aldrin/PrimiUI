/**
 * A custom select element that provides a dropdown list of options.
 * @extends HTMLElement
 * @fires Select#change - Fired when the selected value changes
 * @fires Select#open - Fired when the dropdown opens
 * @fires Select#close - Fired when the dropdown closes
 */
export class SelectRoot extends HTMLElement {
    /**
     * The attributes to observe for changes
     * @returns {string[]} Array of attribute names to observe
     */
    static get observedAttributes() {
        return ["value", "placeholder", "disabled", "open"];
    }

    /** @type {HTMLElement | null} */
    #selectedItem = null;

    /** @type {HTMLElement | null} */
    #focusedItem = null;

    /** @type {(e: MouseEvent) => void} */
    #clickOutsideHandler = null;

    /** @type {(e: KeyboardEvent) => void} */
    #documentKeydownHandler = null;

    /** @type {boolean} */
    #isKeyboardOpen = false;

    constructor() {
        super();
    }

    /**
     * Called when the element is added to the document
     * Sets up accessibility attributes and event listeners
     * @returns {void}
     */
    connectedCallback() {
        // Set ARIA attributes
        this.setAttribute("role", "combobox");
        this.setAttribute("aria-haspopup", "listbox");
        // this.setAttribute("tabindex", "0");

        // Setup event listeners
        this.addEventListener("click", this.#handleClick);
        this.addEventListener("keydown", this.#handleKeydown);
        this.addEventListener("select", this.#handleSelect);
        this.addEventListener("focusin", this.#handleFocusIn);
        this.#setupClickOutside();
        this.#setupDocumentKeydown();

        // Initial setup
        this.#updateSelectedItem();
    }

    /**
     * Called when the element is removed from the document
     * Cleans up event listeners
     * @returns {void}
     */
    disconnectedCallback() {
        this.removeEventListener("click", this.#handleClick);
        this.removeEventListener("keydown", this.#handleKeydown);
        this.removeEventListener("select", this.#handleSelect);
        this.removeEventListener("focusin", this.#handleFocusIn);
        this.#removeClickOutside();
        this.#removeDocumentKeydown();
    }

    /**
     * Sets up document-level keydown handler for Escape key
     */
    #setupDocumentKeydown() {
        this.#documentKeydownHandler = (event) => {
            if (event.key === "Escape" && this.hasAttribute("open")) {
                // console.log("Document Escape pressed, closing select");
                event.preventDefault();
                event.stopPropagation();
                this.removeAttribute("open");
            }
        };
        document.addEventListener(
            "keydown",
            this.#documentKeydownHandler,
            true
        );
    }

    /**
     * Removes document-level keydown handler
     */
    #removeDocumentKeydown() {
        if (this.#documentKeydownHandler) {
            document.removeEventListener(
                "keydown",
                this.#documentKeydownHandler,
                true
            );
            this.#documentKeydownHandler = null;
        }
    }

    /**
     * Handles attribute changes
     * @param {string} name - The name of the attribute that changed
     * @param {string | null} oldValue - The old value of the attribute
     * @param {string | null} newValue - The new value of the attribute
     * @returns {void}
     */
    attributeChangedCallback(name, oldValue, newValue) {
        // console.log(`Attribute changed: ${name}`, { oldValue, newValue });
        if (name === "value") {
            this.#updateSelectedItem();
        } else if (name === "placeholder" && !this.getAttribute("value")) {
            const trigger = this.querySelector("select-trigger");
            if (trigger) {
                // trigger.textContent = newValue || "Select an option";
            }
        } else if (name === "disabled") {
            this.setAttribute("aria-disabled", String(newValue !== null));
            this.setAttribute("tabindex", newValue !== null ? "-1" : "0");
        } else if (name === "open") {
            this.setAttribute("aria-expanded", String(newValue !== null));
            if (newValue !== null) {
                this.dispatchEvent(new CustomEvent("open"));
                if (this.#isKeyboardOpen) {
                    this.#focusFirstItem();
                }
                this.#isKeyboardOpen = false;
            } else {
                this.dispatchEvent(new CustomEvent("close"));
                this.focus();
            }
        }
    }

    /**
     * Handles click events
     * @param {MouseEvent} event - The click event
     */
    #handleClick = (event) => {
        if (this.hasAttribute("disabled")) return;

        const trigger = /** @type {HTMLElement} */ (event.target).closest(
            "select-trigger"
        );
        if (trigger) {
            this.#isKeyboardOpen = false;
            this.toggleAttribute("open");
        }
    };

    /**
     * Handles keydown events
     * @param {KeyboardEvent} event - The keydown event
     */
    #handleKeydown = (event) => {
        // console.log("Keydown event:", event.key);
        if (this.hasAttribute("disabled")) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();

            if (!this.hasAttribute("open")) {
                // console.log("Opening select with keyboard");
                this.#isKeyboardOpen = true;
                this.setAttribute("open", "");
            }
        } else if (event.key === "Tab" && this.hasAttribute("open")) {
            event.preventDefault();
            this.#navigateItems(event.shiftKey ? -1 : 1);
        } else if (
            (event.key === "ArrowDown" || event.key === "ArrowUp") &&
            this.hasAttribute("open")
        ) {
            event.preventDefault();
            this.#navigateItems(event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            this.#isKeyboardOpen = true;
            this.setAttribute("open", "");
        }
    };

    /**
     * Handles select events from items
     * @param {CustomEvent} event - The select event
     */
    #handleSelect = (event) => {
        // console.log("Select event:", event);
        const item = /** @type {HTMLElement} */ (event.target);
        const value = item.getAttribute("value");

        if (value !== this.getAttribute("value")) {
            this.setAttribute("value", value);
            const eventName = this.getAttribute("event-name") || "change";
            const name = this.getAttribute("name") || "select";
            this.dispatchEvent(
                new CustomEvent(`${eventName}`, {
                    bubbles: true,
                    detail: { value, name },
                })
            );
        }

        // console.log("Closing select after selection");
        this.removeAttribute("open");
    };

    /**
     * Handles focus events on items
     * @param {FocusEvent} event - The focus event
     */
    #handleFocusIn = (event) => {
        const item = /** @type {HTMLElement} */ (event.target).closest(
            "select-item"
        );
        if (item) {
            // console.log("Focus on item:", item);
            this.#focusedItem = /** @type {HTMLElement} */ (item);
        }
    };

    /**
     * Updates the selected item and trigger text
     */
    #updateSelectedItem() {
        const value = this.getAttribute("value");
        const items = this.querySelectorAll("select-item");
        const trigger = this.querySelector("select-trigger");

        items.forEach((item) => {
            const isSelected = item.getAttribute("value") === value;
            item.toggleAttribute("selected", isSelected);
            if (isSelected) {
                this.#selectedItem = /** @type {HTMLElement} */ (item);
                if (trigger) {
                    trigger.textContent = item.textContent;
                }
            }
        });

        if (!this.#selectedItem && trigger) {
            // trigger.textContent = this.getAttribute("placeholder") || "Select an option";
        }
    }

    /**
     * Navigates between items
     * @param {number} direction - The direction to navigate (1 for next, -1 for previous)
     */
    #navigateItems(direction) {
        const items = Array.from(
            this.querySelectorAll("select-item:not([disabled], [selected])")
        );
        if (!items.length) return;

        const currentIndex = this.#focusedItem
            ? items.indexOf(this.#focusedItem)
            : -1;
        let nextIndex = currentIndex + direction;

        if (nextIndex < 0) nextIndex = items.length - 1;
        if (nextIndex >= items.length) nextIndex = 0;

        const nextItem = items[nextIndex];
        if (nextItem) {
            /** @type {HTMLElement} */ (nextItem).focus();
        }
    }

    /**
     * Focuses the first non-disabled item
     */
    #focusFirstItem() {
        const firstItem = this.querySelector("select-item:not([disabled],[selected])");
        if (firstItem) {
            /** @type {HTMLElement} */ (firstItem).focus();
        }
    }

    /**
     * Sets up the click outside handler
     */
    #setupClickOutside() {
        this.#clickOutsideHandler = (event) => {
            if (
                !this.contains(/** @type {Node} */ (event.target)) &&
                this.hasAttribute("open")
            ) {
                this.removeAttribute("open");
            }
        };
        document.addEventListener("click", this.#clickOutsideHandler);
    }

    /**
     * Removes the click outside handler
     */
    #removeClickOutside() {
        if (this.#clickOutsideHandler) {
            document.removeEventListener("click", this.#clickOutsideHandler);
            this.#clickOutsideHandler = null;
        }
    }
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get("select-root")) {
    customElements.define("select-root", SelectRoot);
}
