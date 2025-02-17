/**
 * @typedef {Object} Transition
 * @property {function(HTMLElement, Object=): void} [action] - The function to execute when the event occurs.
 * @property {string} [nextState] - The new state to set on the element's attribute after executing the action.
 */

/**
 * @typedef {Object.<string, Object.<string, Transition>>} StateMap
 * The keys of the state map are the possible values of the state attribute.
 * Each state maps to an object whose keys are event identifiers (e.g., "Enter", "ArrowDown")
 * and whose values are Transition objects.
 */

/**
 * @typedef {Object} StateMachineConfig
 * @property {string} stateAttribute - The name of the attribute on the custom element that holds the state.
 * @property {StateMap} stateMap - The mapping of states to their event transitions.
 */

/**
 * A state machine that uses a custom element's attribute as the source of truth.
 *
 * The outer keys in the stateMap correspond to the attribute's possible values.
 * The inner keys map to event keys, and the corresponding Transition defines an action and optional next state.
 */
export class StateMachine {
  /**
   * @param {HTMLElement} element - The custom element instance.
   * @param {StateMachineConfig} config - The configuration for the state machine.
   */
  constructor(element, config, startValue) {
    this.element = element;
    this.stateAttribute = config.stateAttribute;
    this.stateMap = config.stateMap;

    if (!this.element.hasAttribute(config.stateAttribute)) {
      if (startValue) {
        this.element.setAttribute(config.stateAttribute, startValue);
      }
    }
  }

  /**
   * Reads the current state from the element's attribute.
   * @returns {string} The current state.
   */
  #getState() {
    const state = this.element.getAttribute(this.stateAttribute);

    if (!state) {
      throw new Error(
        `Element does not have a valid "${this.stateAttribute}" attribute.`
      );
    }
    return state;
  }

  /**
   * Updates the element's state attribute.
   * @param {string} newState - The new state to set.
   */
  #setState(newState) {
    this.element.setAttribute(this.stateAttribute, newState);
  }

  /**
   * Dispatches an event to the corresponding transition.
   *
   * The event object must contain a 'key' property which is used to lookup the transition
   * in the current state's map.
   *
   * @param {{ key: string, [prop: string]: any }} eventObj - The event object (e.g., { key: "ArrowDown" }).
   */
  dispatch(eventObj) {
    if (!eventObj || !eventObj.key) {
      throw new Error("dispatch() expects an object with a 'key' property.");
    }

    const key = eventObj.key;
    const currentState = this.#getState();
    const stateTransitions = this.stateMap[currentState];

    if (!stateTransitions) {
      console.warn(`No transitions defined for state "${currentState}".`);
      return;
    }

    const transition = stateTransitions[key];
    if (!transition) {
      // console.warn(
      //   `No transition defined for key "${key}" in state "${currentState}".`
      // );
      return false;
    }

    if (typeof transition.action === "function") {
      transition.action(this.element, eventObj);
    }

    if (transition.nextState) {
      this.#setState(transition.nextState);
    }


    return true;
  }
}
