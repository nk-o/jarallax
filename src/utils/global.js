/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-restricted-globals */
let win;

if (typeof window !== 'undefined') {
  win = window;
} else if (typeof global !== 'undefined') {
  win = global;
} else if (typeof self !== 'undefined') {
  win = self;
} else {
  win = {};
}

export default win;
