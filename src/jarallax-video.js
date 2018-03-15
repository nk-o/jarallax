import domLoaded from 'dom-loaded';
import jarallaxVideo from './jarallax-video.esm';

jarallaxVideo();

// data-jarallax-video initialization
domLoaded.then(() => {
    if (typeof jarallax !== 'undefined') {
        jarallax(document.querySelectorAll('[data-jarallax-video]'));
    }
});
