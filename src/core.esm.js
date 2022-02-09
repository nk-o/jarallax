import jarallax from './core';
import jarallaxVideo from './ext-video';
import jarallaxElement from './deprecated/ext-element';

export default {
  jarallax,
  jarallaxVideo() {
    return jarallaxVideo(jarallax);
  },

  // Deprecated.
  jarallaxElement() {
    return jarallaxElement(jarallax);
  },
};
