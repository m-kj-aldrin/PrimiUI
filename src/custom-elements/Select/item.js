export class XSelectEvent extends Event {
  /**@type {SelectItem} */
  target;

  /** @type {string | null} */
  name;

  /**
   * @param {string} value - The value of the selected item
   */
  constructor(value) {
    super("x-select", { bubbles: true, composed: true });
    this.value = value;
  }
}

/**
 * A custom select item element that represents an option in a select dropdown.
 * @extends HTMLElement
 * @fires XSelectEvent - Fired when the item is selected with value detail
 */
export class SelectItem extends HTMLElement {
  static get observedAttributes() {
    return ["x-value", "x-selected", "x-disabled"];
  }

  connectedCallback() {
    this.#setupAttributes();
    this.#setupEventListeners();
  }

  disconnectedCallback() {
    this.#removeEventListeners();
  }

  #setupAttributes() {
    this.setAttribute("role", "option");
    this.setAttribute("tabindex", "0");
  }

  #setupEventListeners() {
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeydown);
  }

  #removeEventListeners() {
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeydown);
  }

  #checkActive() {
    const isSelected = this.hasAttribute("x-selected");
    const isDisabled = this.hasAttribute("x-disabled");
    return !isSelected && !isDisabled;
  }
  #handleClick() {
    if (!this.#checkActive()) return;
    this.#dispatchSelectEvent();
  }

  /**
   * Handles keydown events for keyboard navigation
   * @param {KeyboardEvent} event - The keydown event
   */
  #handleKeydown(event) {
    if (!this.#checkActive()) return;

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
    const event = new XSelectEvent(this.getAttribute("x-value"));
    this.dispatchEvent(event);
  }
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get("select-item")) {
  customElements.define("select-item", SelectItem);
}
