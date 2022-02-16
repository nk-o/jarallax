import domReady from './utils/ready';
import global from './utils/global';
import jarallax from './core';

const $ = global.jQuery;

// jQuery support
if ('undefined' !== typeof $) {
  const $Plugin = function (...args) {
    Array.prototype.unshift.call(args, this);
    const res = jarallax.apply(global, args);
    return 'object' !== typeof res ? res : this;
  };
  $Plugin.constructor = jarallax.constructor;

  // no conflict
  const old$Plugin = $.fn.jarallax;
  $.fn.jarallax = $Plugin;
  $.fn.jarallax.noConflict = function () {
    $.fn.jarallax = old$Plugin;
    return this;
  };
}

// data-jarallax initialization
domReady(() => {
  jarallax(document.querySelectorAll('[data-jarallax]'));
});

export default jarallax;
