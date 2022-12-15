/**
 * Extend like jQuery.extend
 *
 * @param {Object} out - output object.
 * @param {...any} args - additional objects to extend.
 *
 * @returns {Object}
 */
export default function extend(out, ...args) {
  out = out || {};

  Object.keys(args).forEach((i) => {
    if (!args[i]) {
      return;
    }
    Object.keys(args[i]).forEach((key) => {
      out[key] = args[i][key];
    });
  });

  return out;
}
