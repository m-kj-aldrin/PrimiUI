import { clickOutside } from "../../dom-utils/click-outside.js";
import { documentKeyHandler } from "../../dom-utils/document-key-handler.js";
import { getSiblingOfSameTag } from "../../dom-utils/traversal.js";

/**
 * A custom select element that provides a dropdown list of options.
 * @extends HTMLElement
 * @fires Select#x-select - Fired when an item is selected
 */
export class SelectRoot extends HTMLElement {
  static get observedAttributes() {
    return ["x-value", "x-disabled", "x-state"];
  }

  /** @type {import("./item").SelectItem | null} */
  #focusedItem = null;

  /** @type {() => void} */
  #clickOutsideCleanup = null;

  /** @type {() => void} */
  #documentKeydownCleanup = null;

  /**@type {AbortController} */
  #controller;

  connectedCallback() {
    this.#setupAttributes();
    this.#setupEventListeners();
  }

  #setupAttributes() {
    this.setAttribute("role", "combobox");
    this.setAttribute("aria-haspopup", "listbox");
  }

  #setupEventListeners() {
    this.#controller = new AbortController();
    let signal = this.#controller.signal;

    this.addEventListener("click", this.#handleClick, { signal });
    this.addEventListener("keydown", this.#handleKeydown, { signal });
    this.addEventListener("x-select", this.#handleSelect, { signal });
    this.addEventListener("focusin", this.#handleFocusIn, { signal });

    this.#clickOutsideCleanup = clickOutside(this, () =>
      this.setAttribute("x-state", "closed")
    );
  }

  disconnectedCallback() {
    this.#controller.abort();

    this.#clickOutsideCleanup();
  }

  /**
   * Sets up document-level keydown handler for Escape key
   * @param {KeyboardEvent} event - The keydown event
   */
  #documentEscHandler(event) {
    let key = event.key;

    let state = this.getAttribute("x-state");

    if (key === "Escape" && state == "open") {
      this.setAttribute("x-state", "closed");
      event.preventDefault();
      event.stopPropagation();
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
    } else if (name === "x-state") {
      let state = newValue;

      if (state === "closed") {
        this.querySelector("select-trigger")?.focus();
        this.#focusedItem = null;
        this.#documentKeydownCleanup?.();
      } else if (state === "open") {
        this.#documentKeydownCleanup = documentKeyHandler(
          this.#documentEscHandler.bind(this)
        );
      }
    }
  }

  /**
   * Handles click events
   * @param {MouseEvent} event - The click event
   */
  #handleClick(event) {
    if (this.hasAttribute("x-disabled")) return;
    const target = /** @type {HTMLElement} */ (event.target);

    const trigger = target.closest("select-trigger");
    if (trigger) {
      let state = this.getAttribute("x-state");
      this.setAttribute("x-state", state == "closed" ? "open" : "closed");
    }
  }

  /**
   * Handles keydown events
   * @param {KeyboardEvent} event - The keydown event
   */
  #handleKeydown(event) {
    if (this.hasAttribute("x-disabled")) return;

    let state = this.getAttribute("x-state");
    let key = event.key + (event.shiftKey ? "Shift" : "");

    if (!/Enter| |ArrowUp|ArrowDown|Tab|TabShift/.test(key)) return;

    let prevent = false;

    if (state == "closed") {
      if (/Enter| |ArrowUp|ArrowDown/.test(key)) {
        this.setAttribute("x-state", "open");
        prevent = true;
      }
    } else if (state == "open") {
      if (/Enter| /.test(key)) {
        this.setAttribute("x-state", "closed");
        prevent = true;
      } else if (/ArrowUp|ArrowDown|Tab|TabShift/.test(key)) {
        this.#navigateItems(key == "ArrowDown" || key == "Tab" ? 1 : -1);
        prevent = true;
      }
    }

    if (prevent) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handles select events from items
   * @param {import("./item").XSelectEvent} event - The select event
   */
  #handleSelect(event) {
    const value = event.value;

    if (value !== this.getAttribute("x-value")) {
      this.setAttribute("x-value", value);
      this.setAttribute("x-state", "closed");
      event.name = this.getAttribute("x-name");
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handles focus events on items
   * @param {FocusEvent} event - The focus event
   */
  #handleFocusIn = (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const item = target.closest("select-item");
    if (item) this.#focusedItem = item;
  };

  /** Updates the selected item and trigger text */
  #updateSelectedItem() {
    const value = this.getAttribute("x-value");
    const items = this.querySelectorAll("select-item");
    const trigger = this.querySelector("select-trigger");

    /** @type {import("./item.js").SelectItem | null} */
    let selected = null;

    items.forEach((item) => {
      const isSelected = item.getAttribute("x-value") === value;
      item.toggleAttribute("x-selected", isSelected);
      if (isSelected) selected = item;
    });

    if (trigger && selected) {
      trigger.textContent = selected.textContent;
    }
  }

  /**
   * Navigates between items
   * @param {number} direction - The direction to navigate (1 for next, -1 for previous)
   */
  #navigateItems(direction) {
    if (!this.#focusedItem) {
      let collection = this.querySelectorAll(
        "select-item:not([x-disabled],[x-selected])"
      );
      if (direction == 1) collection[0]?.focus();
      else if (direction == -1) collection[collection.length - 1]?.focus();
    } else {
      const nextItem = getSiblingOfSameTag(
        this.#focusedItem,
        direction,
        ":not([x-disabled],[x-selected])"
      );

      nextItem.focus();
    }
  }
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get("select-root")) {
  customElements.define("select-root", SelectRoot);
}
