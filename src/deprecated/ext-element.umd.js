import domReady from '../utils/ready';
import global from '../utils/global';

import jarallaxElement from './ext-element';

jarallaxElement();

// data-jarallax-element initialization
domReady(() => {
  if (typeof global.jarallax !== 'undefined') {
    global.jarallax(document.querySelectorAll('[data-jarallax-element]'));
  }
});

export default jarallaxElement;
