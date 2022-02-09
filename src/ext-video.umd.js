import domReady from './utils/ready';
import global from './utils/global';
import jarallaxVideo from './ext-video';

jarallaxVideo();

// data-jarallax-video initialization
domReady(() => {
  if (typeof global.jarallax !== 'undefined') {
    global.jarallax(document.querySelectorAll('[data-jarallax-video]'));
  }
});

export default jarallaxVideo;
