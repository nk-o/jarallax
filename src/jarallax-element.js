import domLoaded from 'dom-loaded';
import jarallaxElement from './jarallax-element.esm';

jarallaxElement();

// data-jarallax-element initialization
domLoaded.then(() => {
    if (typeof jarallax !== 'undefined') {
        jarallax(document.querySelectorAll('[data-jarallax-element]'));
    }
});
