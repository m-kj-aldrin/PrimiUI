/**
 * Adds an event listener to the document to detect clicks outside of a given element.
 * @param {HTMLElement} element - The element to detect clicks outside of.
 * @param {Function} callback - The function to call when a click outside the element is detected.
 */
export function clickOutside(element, callback) {
  /** @param {MouseEvent} event - The click event */
  function handleClick(event) {
    if (!(event.target instanceof HTMLElement)) return;
    if (!element.contains(event.target)) callback(event);
  }

  document.addEventListener("click", handleClick);

  return () => {
    console.log("cleanup");

    document.removeEventListener("click", handleClick);
  };
}
