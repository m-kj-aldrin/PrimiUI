/**
 * A custom select item element that represents an option in a select dropdown.
 * @extends HTMLElement
 * @fires SelectItem#select - Fired when the item is selected with value detail
 */
export class SelectItem extends HTMLElement {
  /**
   * The attributes to observe for changes
   * @returns {string[]} Array of attribute names to observe
   */
  static get observedAttributes() {
    return ["value", "selected", "disabled"];
  }

  /**
   * Called when the element is added to the document
   * Sets up accessibility attributes and event listeners
   * @returns {void}
   */
  connectedCallback() {
    this.#setupAccessibility();
    this.#setupEventListeners();
  }

  /**
   * Called when the element is removed from the document
   * Cleans up event listeners
   * @returns {void}
   */
  disconnectedCallback() {
    this.#removeEventListeners();
  }

  /**
   * Handles attribute changes and updates ARIA states
   * @param {string} name - The name of the attribute that changed
   * @param {string | null} oldValue - The old value of the attribute
   * @param {string | null} newValue - The new value of the attribute
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    this.#updateAriaStates(name, newValue);
  }

  /**
   * Sets up initial accessibility attributes
   */
  #setupAccessibility() {
    this.setAttribute("role", "option");
    this.setAttribute("tabindex", "0");
  }

  /**
   * Sets up event listeners
   */
  #setupEventListeners() {
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeydown);
  }

  /**
   * Removes event listeners
   */
  #removeEventListeners() {
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeydown);
  }

  /**
   * Updates ARIA states based on attribute changes
   * @param {string} name - The name of the attribute that changed
   * @param {string | null} value - The new value of the attribute
   */
  #updateAriaStates(name, value) {
    if (name === "selected") {
      this.setAttribute("aria-selected", String(value !== null));
      this.setAttribute("tabindex", value !== null ? "0" : "-1");
    } else if (name === "disabled") {
      this.setAttribute("aria-disabled", String(value !== null));
      this.setAttribute("tabindex", value !== null ? "-1" : "0");
    }
  }

  /**
   * Handles click events and dispatches select event if not disabled
   * @param {MouseEvent} event - The click event
   */
  #handleClick(event) {
    if (this.hasAttribute("disabled")) return;
    this.#dispatchSelectEvent();
  }

  /**
   * Handles keydown events for keyboard navigation
   * @param {KeyboardEvent} event - The keydown event
   */
  #handleKeydown(event) {
    console.log("Keydown event:", event.key);
    if (this.hasAttribute("disabled")) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      this.#dispatchSelectEvent();
    }
  }

  /**
   * Dispatches the select event with the current value
   */
  #dispatchSelectEvent() {
    this.dispatchEvent(
      new CustomEvent("select", {
        bubbles: true,
        composed: true,
        detail: {
          value: this.getAttribute("value"),
        },
      })
    );
  }
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get("select-item")) {
  customElements.define("select-item", SelectItem);
}
