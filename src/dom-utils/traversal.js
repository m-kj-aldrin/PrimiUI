/**
 * Gets the sibling of the same tag name, looping around if needed.
 * @param {HTMLElement} element - The reference element.
 * @param {number} direction - Positive for next sibling, negative for previous.
 * @param {string} [test=""] - Optional CSS selector test.
 * @returns {HTMLElement | null}
 */
export function getSiblingOfSameTag(element, direction, test = "") {
  const parent = element.parentElement;
  if (!parent) return null; // Can't loop without a parent.

  /** @type {HTMLElement} */
  let sibling = element;

  while (true) {
    /** @type {Element | null} */
    let candidate =
      direction > 0
        ? sibling.nextElementSibling
        : sibling.previousElementSibling;

    // Wrap around if no candidate exists.
    if (!candidate) {
      candidate =
        direction > 0 ? parent.firstElementChild : parent.lastElementChild;
    }

    if (!(candidate instanceof HTMLElement)) return null;

    sibling = candidate;

    // If we've looped back to the starting element, no valid sibling exists.
    if (sibling === element) return null;

    // Return if the sibling has the same tag name and passes the test (if provided).
    if (
      sibling.tagName === element.tagName &&
      (!test || sibling.matches(test))
    ) {
      return sibling;
    }
  }
}
