import domReady from 'lite-ready';
import global from 'global';

import jarallaxElement from './jarallax-element.esm';

jarallaxElement();

// data-jarallax-element initialization
domReady( () => {
    if ( 'undefined' !== typeof global.jarallax ) {
        global.jarallax( document.querySelectorAll( '[data-jarallax-element]' ) );
    }
} );
