export default {
  // Base parallax options.
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

  // Callbacks.
  onScroll: null,
  onInit: null,
  onDestroy: null,
  onCoverImage: null,

  // Video options.
  videoClass: 'jarallax-video',
  videoSrc: null,
  videoStartTime: 0,
  videoEndTime: 0,
  videoVolume: 0,
  videoLoop: true,
  videoPlayOnlyVisible: true,
  videoLazyLoading: true,
  disableVideo: false,

  // Video callbacks.
  onVideoInsert: null,
  onVideoWorkerInit: null,
};
