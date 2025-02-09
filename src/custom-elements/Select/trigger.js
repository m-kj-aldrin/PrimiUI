/**
 * A trigger element for the select component
 * @extends HTMLElement
 */
export class SelectTrigger extends HTMLElement {
  constructor() {
    super();
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
   * Sets up accessibility attributes
   */
  #setupAccessibility() {
    this.setAttribute("role", "button");
    this.setAttribute("tabindex", "-1");
    this.setAttribute("aria-haspopup", "listbox");
  }

  /**
   * Sets up event listeners
   */
  #setupEventListeners() {
    this.addEventListener("keydown", this.#handleKeydown);
  }

  /**
   * Removes event listeners
   */
  #removeEventListeners() {
    this.removeEventListener("keydown", this.#handleKeydown);
  }

  /**
   * Handles keydown events
   * @param {KeyboardEvent} event - The keydown event
   */
  #handleKeydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      const select = this.closest("select-root");
      if (select) {
        select.removeAttribute("open");
      }
    }
  };
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get("select-trigger")) {
  customElements.define("select-trigger", SelectTrigger);
}
