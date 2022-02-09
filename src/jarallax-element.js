import domReady from 'lite-ready';
import global from 'global';

import jarallaxElement from './jarallax-element.esm';

jarallaxElement();

// data-jarallax-element initialization
domReady(() => {
  if (typeof global.jarallax !== 'undefined') {
    global.jarallax(document.querySelectorAll('[data-jarallax-element]'));
  }
});
