/**
 * @typedef {Object} EventObject
 * @property {string} [nextState]
 * @property {(element: HTMLElement, event: string) => void} [action]
 */

/**
 * @typedef {Object<string, EventObject>} StateObject
 */

/**
 * @typedef {Object<string, StateObject>} StateMap
 */

/**
 *
 * @param {StateMap} stateMap
 * @param {string} event
 * @param {HTMLElement} element
 * @param {string} attributeName
 */
export function transitionState(
  stateMap,
  event,
  element,
  attributeName = "data-state"
) {
  console.log({ stateMap, event, element, attributeName });

  const currentState = element.getAttribute(attributeName);
  if (!currentState) return false;

  const eventObject = stateMap[currentState][event];

  console.log({ eventObject });

  if (!eventObject) return false;

  if (eventObject.action) {
    eventObject.action(element, event);
  }
  if (!eventObject.nextState) {
    return currentState;
  }

  element.setAttribute(attributeName, eventObject.nextState);
  return eventObject.nextState;
}
