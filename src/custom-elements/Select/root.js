import { clickOutside } from "../../dom-utils/click-outside.js";
import { getSiblingOfSameTag } from "../../dom-utils/traversal.js";
import { StateMachine } from "../../dom-utils/state.js";

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

  /** @type {(e: MouseEvent) => void} */
  #clickOutsideHandler = null;

  /** @type {() => void} */
  #clickOutsideCleanup = null;

  /** @type {(e: KeyboardEvent) => void} */
  #documentKeydownHandler = null;

  #state = new StateMachine(this, {
    stateAttribute: "x-state",
    stateMap: {
      open: {
        Enter: {
          nextState: "closed",
        },
        Escape: {
          nextState: "closed",
        },
        ArrowDown: {
          action: () => {
            this.#navigateItems(1);
          },
        },
        ArrowUp: {
          action: () => {
            this.#navigateItems(-1);
          },
        },
        Tab: {
          action: (_, event) => {
            this.#navigateItems(event.shiftKey ? -1 : 1);
          },
        },
      },
      closed: {
        Enter: {
          nextState: "open",
        },
        ArrowDown: {
          nextState: "open",
          action: () => {
            this.#navigateItems(1);
          },
        },
        ArrowUp: {
          nextState: "open",
          action: () => {
            this.#navigateItems(-1);
          },
        },
      },
    },
  });

  connectedCallback() {
    this.#setupAttributes();
    this.#setupEventListeners();
  }

  #setupAttributes() {
    this.setAttribute("role", "combobox");
    this.setAttribute("aria-haspopup", "listbox");
  }

  #setupEventListeners() {
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeydown);
    this.addEventListener("x-select", this.#handleSelect);
    this.addEventListener("focusin", this.#handleFocusIn);
    this.#clickOutsideCleanup = clickOutside(this, () =>
      this.#state.dispatch({ key: "Escape" })
    );
    this.#setupDocumentKeydown();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeydown);
    this.removeEventListener("x-select", this.#handleSelect);
    this.removeEventListener("focusin", this.#handleFocusIn);
    this.#clickOutsideCleanup();
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
        this.#state.dispatch({ key: "closed" });
      }
    };
    document.addEventListener("keydown", this.#documentKeydownHandler, true);
  }

  /** Removes document-level keydown handler */
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
    } else if (name === "x-state") {
      let state = newValue;

      if (state === "closed") {
        this.querySelector("select-trigger")?.focus();
        this.#focusedItem = null;
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
      this.#state.dispatch({ key: "Enter" });
    }
  }

  /**
   * Handles keydown events
   * @param {KeyboardEvent} event - The keydown event
   */
  #handleKeydown(event) {
    if (this.hasAttribute("x-disabled")) return;

    let result = this.#state.dispatch(event);

    console.log("result");

    if (result) {
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
      this.#state.dispatch({ key: "Enter" });
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
