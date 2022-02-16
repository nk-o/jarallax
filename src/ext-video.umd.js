import domReady from './utils/ready';
import global from './utils/global';
import jarallaxVideo from './ext-video';

jarallaxVideo();

// data-jarallax-video initialization
domReady(() => {
  if ('undefined' !== typeof global.jarallax) {
    global.jarallax(document.querySelectorAll('[data-jarallax-video]'));
  }
});

export default jarallaxVideo;
