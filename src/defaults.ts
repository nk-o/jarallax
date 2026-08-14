import type { JarallaxOptions } from './types';

const defaults: JarallaxOptions = {
  type: 'scroll',
  speed: 0.5,
  containerClass: 'jarallax-container',
  imgSrc: null,
  imgElement: '.jarallax-img',
  imgSize: 'cover',
  imgPosition: '50% 50%',
  imgRepeat: 'no-repeat',
  keepImg: false,
  elementInViewport: null,
  zIndex: -100,
  disableParallax: false,
  onScroll: null,
  onInit: null,
  onDestroy: null,
  onCoverImage: null,
  videoClass: 'jarallax-video',
  videoSrc: null,
  videoStartTime: 0,
  videoEndTime: 0,
  videoVolume: 0,

  // Empty means "whatever video-worker defaults to", so the host is not pinned in two places.
  videoYoutubeHost: '',
  videoVimeoHost: '',
  videoLoop: true,
  videoPlayOnlyVisible: true,
  videoLazyLoading: true,
  disableVideo: false,
  onVideoInsert: null,
  onVideoWorkerInit: null,
};

export default defaults;
