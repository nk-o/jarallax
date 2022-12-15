/**
 * Get all parents of the element.
 *
 * @param {Element} elem - DOM element.
 *
 * @returns {Array}
 */
export default function getParents(elem) {
  const parents = [];

  while (elem.parentElement !== null) {
    elem = elem.parentElement;

    if (elem.nodeType === 1) {
      parents.push(elem);
    }
  }

  return parents;
}
