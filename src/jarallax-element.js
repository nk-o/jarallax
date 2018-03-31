import domReady from 'lite-ready';
import jarallaxElement from './jarallax-element.esm';

jarallaxElement();

// data-jarallax-element initialization
domReady(() => {
    if (typeof jarallax !== 'undefined') {
        jarallax(document.querySelectorAll('[data-jarallax-element]'));
    }
});
