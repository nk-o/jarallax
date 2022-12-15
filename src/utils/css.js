import global from './global';

/**
 * Add styles to element.
 *
 * @param {Element} el - element.
 * @param {String|Object} styles - styles list.
 *
 * @returns {Element}
 */
export default function css(el, styles) {
  if (typeof styles === 'string') {
    return global.getComputedStyle(el).getPropertyValue(styles);
  }

  Object.keys(styles).forEach((key) => {
    el.style[key] = styles[key];
  });
  return el;
}
