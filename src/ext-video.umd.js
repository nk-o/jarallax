import VideoWorker from 'video-worker';

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

// We should add VideoWorker globally, since some project uses it.
if (!global.VideoWorker) {
  global.VideoWorker = VideoWorker;
}

export default jarallaxVideo;
