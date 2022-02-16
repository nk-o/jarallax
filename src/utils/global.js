/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-restricted-globals */
let win;

if ('undefined' !== typeof window) {
  win = window;
} else if ('undefined' !== typeof global) {
  win = global;
} else if ('undefined' !== typeof self) {
  win = self;
} else {
  win = {};
}

export default win;
