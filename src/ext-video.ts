import VideoWorker from 'video-worker';

import type { JarallaxCoverImageData, JarallaxInstance, JarallaxStatic } from './types';
import global from './utils/global';

function jarallaxVideo(jarallax: JarallaxStatic | undefined = global.jarallax): void {
  if (typeof jarallax === 'undefined') {
    return;
  }

  const Jarallax = jarallax.constructor;
  const defOnScroll = Jarallax.prototype.onScroll;

  // Video DOM is inserted lazily once the instance becomes eligible, which preserves the old lazy-loading behavior.
  Jarallax.prototype.onScroll = function onScrollWithVideo(this: JarallaxInstance): void {
    defOnScroll.apply(this);

    const isReady =
      !this.isVideoInserted &&
      this.video &&
      (!this.options.videoLazyLoading || this.isElementInViewport) &&
      !this.options.disableVideo();

    if (!isReady) {
      return;
    }

    this.isVideoInserted = true;
    this.video?.getVideo((video: HTMLElement) => {
      const insertedVideo = video as HTMLIFrameElement | HTMLVideoElement;
      const parent = insertedVideo.parentNode as HTMLElement | null;

      this.css(insertedVideo, {
        position: this.image.position,
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
        width: '100%',
        height: '100%',
        maxWidth: 'none',
        maxHeight: 'none',
        pointerEvents: 'none',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        margin: 0,
        zIndex: -1,
      });
      this.$video = insertedVideo;

      // Self-hosted video should keep using the image as a poster, just like the legacy extension did.
      if (this.video?.type === 'local') {
        if (this.image.src) {
          insertedVideo.setAttribute('poster', this.image.src);
        } else if (this.image.$item?.tagName === 'IMG') {
          insertedVideo.setAttribute('poster', (this.image.$item as HTMLImageElement).src);
        }
      }

      if (this.options.videoClass) {
        insertedVideo.setAttribute(
          'class',
          `${this.options.videoClass} ${this.options.videoClass}-${this.video?.type}`
        );
      }

      this.image.$container?.appendChild(insertedVideo);
      parent?.parentNode?.removeChild(parent);
      this.options.onVideoInsert?.call(this);
    });
  };

  const defCoverImage = Jarallax.prototype.coverImage;

  // Reuse the core cover logic, then resize the actual video element to match the computed image box.
  Jarallax.prototype.coverImage = function coverVideo(
    this: JarallaxInstance
  ): JarallaxCoverImageData | true | undefined {
    const imageData = defCoverImage.apply(this) as JarallaxCoverImageData | true | undefined;
    const node = this.image.$item?.nodeName;

    if (
      !imageData ||
      imageData === true ||
      !this.video ||
      !node ||
      (node !== 'IFRAME' && node !== 'VIDEO') ||
      !this.$video
    ) {
      return imageData;
    }

    let h = imageData.image.height;
    let w = (h * (this.image.width || 0)) / (this.image.height || 1);
    let ml = (imageData.container.width - w) / 2;
    let mt = imageData.image.marginTop;

    if (imageData.container.width > w) {
      w = imageData.container.width;
      h = (w * (this.image.height || 0)) / (this.image.width || 1);
      ml = 0;
      mt += (imageData.image.height - h) / 2;
    }

    // Iframes need extra vertical overscan to hide native player controls outside the visible crop.
    if (node === 'IFRAME') {
      h += 400;
      mt -= 200;
    }

    this.css(this.$video, {
      width: `${w}px`,
      marginLeft: `${ml}px`,
      height: `${h}px`,
      marginTop: `${mt}px`,
    });

    return imageData;
  };

  const defInitImg = Jarallax.prototype.initImg;

  // The video extension can bootstrap from `data-jarallax-video` even when no option object was passed in.
  Jarallax.prototype.initImg = function initVideoImage(this: JarallaxInstance): boolean {
    const defaultResult = defInitImg.apply(this) as boolean;

    if (!this.options.videoSrc) {
      this.options.videoSrc = this.$item.getAttribute('data-jarallax-video') || null;
    }

    if (this.options.videoSrc) {
      this.defaultInitImgResult = defaultResult;
      return true;
    }

    return defaultResult;
  };

  const defCanInitParallax = Jarallax.prototype.canInitParallax;

  // Video setup happens inside canInitParallax() so the extension can decide between real parallax and static fallback.
  Jarallax.prototype.canInitParallax = function canInitVideoParallax(
    this: JarallaxInstance
  ): boolean {
    let defaultResult = defCanInitParallax.apply(this) as boolean;

    if (!this.options.videoSrc) {
      return defaultResult;
    }

    const video = new VideoWorker(this.options.videoSrc, {
      autoplay: true,
      loop: this.options.videoLoop,
      showControls: false,
      accessibilityHidden: true,
      startTime: Number(this.options.videoStartTime || 0),
      endTime: Number(this.options.videoEndTime || 0),
      // `data-video-volume` reaches us as a string, and "0" is truthy. Compare the number.
      mute: !Number(this.options.videoVolume),
      volume: Number(this.options.videoVolume || 0),
      // video-worker ignores undefined, so an unset host keeps its own default.
      youtubeHost: this.options.videoYoutubeHost || undefined,
      vimeoHost: this.options.videoVimeoHost || undefined,
    });

    this.options.onVideoWorkerInit?.call(this, video);

    const resetDefaultImage = () => {
      // Errors or completed non-looping videos fall back to the original image element.
      if (this.image.$default_item) {
        this.image.$item = this.image.$default_item;
        this.image.$item.style.display = 'block';
        this.coverImage();
        this.onScroll();
      }
    };

    if (!video.isValid()) {
      return defaultResult;
    }

    // Video support must still work even when parallax is disabled on mobile/user-agent checks.
    if (this.options.disableParallax()) {
      defaultResult = true;
      this.image.position = 'absolute';
      this.options.type = 'scroll';
      this.options.speed = 1;
    }

    if (!defaultResult) {
      // If the instance cannot initialize parallax, keep the historical behavior of swapping in a thumbnail background.
      if (!this.defaultInitImgResult) {
        video.getImageURL((url) => {
          const currentStyle = this.$item.getAttribute('style');

          if (currentStyle) {
            this.$item.setAttribute('data-jarallax-original-styles', currentStyle);
          }

          this.css(this.$item, {
            backgroundImage: `url("${url}")`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          });
        });
      }

      return defaultResult;
    }

    video.on('ready', () => {
      // Visibility-driven play/pause is applied by wrapping the existing onScroll implementation.
      if (this.options.videoPlayOnlyVisible) {
        const oldOnScroll = this.onScroll;

        this.onScroll = function onScrollPlayVideo(this: JarallaxInstance): void {
          oldOnScroll.apply(this);

          if (
            !this.videoError &&
            (this.options.videoLoop || (!this.options.videoLoop && !this.videoEnded))
          ) {
            if (this.isVisible()) {
              video.play();
            } else {
              video.pause();
            }
          }
        };
      } else {
        video.play();
      }
    });

    video.on('started', () => {
      // Once the real video starts, it becomes the active visual source used by core sizing logic.
      this.image.$default_item = this.image.$item;
      this.image.$item = this.$video as HTMLElement;
      this.image.width = this.video?.videoWidth || 1280;
      this.image.height = this.video?.videoHeight || 720;
      this.coverImage();
      this.onScroll();

      if (this.image.$default_item) {
        this.image.$default_item.style.display = 'none';
      }
    });

    video.on('ended', () => {
      this.videoEnded = true;

      if (!this.options.videoLoop) {
        resetDefaultImage();
      }
    });

    video.on('error', () => {
      this.videoError = true;
      resetDefaultImage();
    });

    this.video = video;

    if (!this.defaultInitImgResult) {
      // Remote providers need an async thumbnail first; local videos can initialize immediately.
      this.image.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

      if (video.type !== 'local') {
        video.getImageURL((url) => {
          this.image.bgImage = `url("${url}")`;
          this.init();
        });

        return false;
      }
    }

    return defaultResult;
  };

  const defDestroy = Jarallax.prototype.destroy;

  // Restore the original image reference before core destroy() tears down the DOM.
  Jarallax.prototype.destroy = function destroyVideo(this: JarallaxInstance): void {
    if (this.image.$default_item) {
      this.image.$item = this.image.$default_item;
      delete this.image.$default_item;
    }

    defDestroy.apply(this);
  };
}

export default jarallaxVideo;
