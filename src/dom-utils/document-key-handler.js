/**
 * Adds an event listener to the document to handle keydown events.
 * @param {()=>void} callback
 * @returns
 */
export function documentKeyHandler(callback) {
  document.addEventListener("keydown", callback, { capture: true });
  return () => {
    document.removeEventListener("keydown", callback, { capture: true });
  };
}
