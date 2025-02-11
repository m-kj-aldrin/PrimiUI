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
        return ["x-value", "x-disabled", "x-open"];
    }

    /** @type {import("./item").SelectItem | null} */
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
            if (event.key === "Escape" && this.hasAttribute("x-open")) {
                event.preventDefault();
                event.stopPropagation();
                this.removeAttribute("x-open");
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
        if (name === "x-value") {
            this.#updateSelectedItem();
        } else if (name === "x-disabled") {
            this.setAttribute("aria-disabled", String(newValue !== null));
        } else if (name === "x-open") {
            this.setAttribute("aria-expanded", String(newValue !== null));
            if (newValue !== null) {
                this.dispatchEvent(new CustomEvent("open"));
                if (this.#isKeyboardOpen) {
                    this.#focusFirstItem();
                }
                this.#isKeyboardOpen = false;
            } else {
                this.dispatchEvent(new CustomEvent("close"));
                this.querySelector("select-trigger")?.focus();
            }
        }
    }

    /**
     * Handles click events
     * @param {MouseEvent} event - The click event
     */
    #handleClick = (event) => {
        if (this.hasAttribute("x-disabled")) return;

        const trigger = /** @type {HTMLElement} */ (event.target).closest(
            "select-trigger"
        );
        if (trigger) {
            this.#isKeyboardOpen = false;
            this.toggleAttribute("x-open");
        }
    };

    /**
     * Handles keydown events
     * @param {KeyboardEvent} event - The keydown event
     */
    #handleKeydown = (event) => {
        if (this.hasAttribute("x-disabled")) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();

            if (!this.hasAttribute("x-open")) {
                this.#isKeyboardOpen = true;
                this.setAttribute("x-open", "");
            }
        } else if (event.key === "Tab" && this.hasAttribute("x-open")) {
            event.preventDefault();
            this.#navigateItems(event.shiftKey ? -1 : 1);
        } else if (
            (event.key === "ArrowDown" || event.key === "ArrowUp") &&
            this.hasAttribute("x-open")
        ) {
            event.preventDefault();
            this.#navigateItems(event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            this.#isKeyboardOpen = true;
            this.setAttribute("x-open", "");
        }
    };

    /**
     * Handles select events from items
     * @param {CustomEvent} event - The select event
     */
    #handleSelect = (event) => {
        // console.log("Select event:", event);
        const item = /** @type {HTMLElement} */ (event.target);
        const value = item.getAttribute("x-value");

        if (value !== this.getAttribute("x-value")) {
            this.setAttribute("x-value", value);
            const eventName = this.getAttribute("x-event-name") || "change";
            const name = this.getAttribute("x-name") || "select";
            this.dispatchEvent(
                new CustomEvent(`${eventName}`, {
                    bubbles: true,
                    detail: { value, name },
                })
            );
        }

        // console.log("Closing select after selection");
        this.removeAttribute("x-open");
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
        const value = this.getAttribute("x-value");
        const items = this.querySelectorAll("select-item");
        const trigger = this.querySelector("select-trigger");

        items.forEach((item) => {
            const isSelected = item.getAttribute("x-value") === value;
            item.toggleAttribute("x-selected", isSelected);
            if (isSelected) {
                if (trigger) {
                    trigger.textContent = item.textContent;
                }
            }
        });
    }

    #getAvailableItems() {
        return Array.from(
            this.querySelectorAll("select-item:not([x-disabled], [x-selected])")
        );
    }

    /**
     * Navigates between items
     * @param {number} direction - The direction to navigate (1 for next, -1 for previous)
     */
    #navigateItems(direction) {
        const items = this.#getAvailableItems();
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
        const firstItem = this.querySelector(
            "select-item:not([x-disabled],[x-selected])"
        );
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
                this.hasAttribute("x-open")
            ) {
                this.removeAttribute("x-open");
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
