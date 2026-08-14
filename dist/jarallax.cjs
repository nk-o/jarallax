/*!
 * Jarallax v3.1.0 (https://github.com/nk-o/jarallax)
 * Copyright 2026 nK <https://nkdev.info>
 * Licensed under MIT (https://github.com/nk-o/jarallax/blob/master/LICENSE)
 */
'use strict';

const defaults$1 = {
  type: "scroll",
  speed: 0.5,
  containerClass: "jarallax-container",
  imgSrc: null,
  imgElement: ".jarallax-img",
  imgSize: "cover",
  imgPosition: "50% 50%",
  imgRepeat: "no-repeat",
  keepImg: false,
  elementInViewport: null,
  zIndex: -100,
  disableParallax: false,
  onScroll: null,
  onInit: null,
  onDestroy: null,
  onCoverImage: null,
  videoClass: "jarallax-video",
  videoSrc: null,
  videoStartTime: 0,
  videoEndTime: 0,
  videoVolume: 0,
  // Empty means "whatever video-worker defaults to", so the host is not pinned in two places.
  videoYoutubeHost: "",
  videoVimeoHost: "",
  videoLoop: true,
  videoPlayOnlyVisible: true,
  videoLazyLoading: true,
  disableVideo: false,
  onVideoInsert: null,
  onVideoWorkerInit: null
};

let win$1;
if (typeof window !== "undefined") {
  win$1 = window;
} else if (typeof global !== "undefined") {
  win$1 = global;
} else if (typeof self !== "undefined") {
  win$1 = self;
} else {
  win$1 = {};
}
var global$2 = win$1;

function css(el, styles) {
  if (typeof styles === "string") {
    return global$2.getComputedStyle(el).getPropertyValue(styles);
  }
  Object.keys(styles).forEach((key) => {
    el.style[key] = styles[key];
  });
  return el;
}

function extend$1(out, ...args) {
  const result = out || {};
  Object.keys(args).forEach((index) => {
    const source = args[Number(index)];
    if (!source) {
      return;
    }
    Object.keys(source).forEach((key) => {
      result[key] = source[key];
    });
  });
  return result;
}

function getParents(elem) {
  const parents = [];
  let currentElement = elem;
  while (currentElement.parentElement !== null) {
    currentElement = currentElement.parentElement;
    if (currentElement.nodeType === 1) {
      parents.push(currentElement);
    }
  }
  return parents;
}

function ready(callback) {
  if (typeof document === "undefined") {
    return;
  }
  if (document.readyState === "complete" || document.readyState === "interactive") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback, {
      capture: true,
      once: true,
      passive: true
    });
  }
}

const mobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  global$2.navigator?.userAgent ?? ""
);
function isMobile() {
  return mobileAgent;
}

let wndW = 0;
let wndH = 0;
let deviceHelper = null;
function hasDocument() {
  return typeof document !== "undefined" && typeof document.documentElement !== "undefined";
}
function getDeviceHeight() {
  if (!hasDocument()) {
    return global$2.innerHeight || 0;
  }
  if (!deviceHelper && document.body) {
    deviceHelper = document.createElement("div");
    deviceHelper.style.cssText = "position: fixed; top: -9999px; left: 0; height: 100vh; width: 0;";
    document.body.appendChild(deviceHelper);
  }
  return (deviceHelper ? deviceHelper.clientHeight : 0) || global$2.innerHeight || document.documentElement.clientHeight;
}
function updateWindowHeight() {
  if (!hasDocument()) {
    wndW = global$2.innerWidth || 0;
    wndH = global$2.innerHeight || 0;
    return;
  }
  wndW = global$2.innerWidth || document.documentElement.clientWidth;
  wndH = isMobile() ? getDeviceHeight() : global$2.innerHeight || document.documentElement.clientHeight;
}
updateWindowHeight();
global$2.addEventListener?.("resize", updateWindowHeight);
global$2.addEventListener?.("orientationchange", updateWindowHeight);
global$2.addEventListener?.("load", updateWindowHeight);
ready(() => {
  updateWindowHeight();
});
function getWindowSize() {
  return {
    width: wndW,
    height: wndH
  };
}

const jarallaxList = [];
function updateParallax() {
  if (!jarallaxList.length) {
    return;
  }
  const { width: wndW, height: wndH } = getWindowSize();
  jarallaxList.forEach((data, index) => {
    const { instance, oldData } = data;
    if (!instance.isVisible()) {
      return;
    }
    const clientRect = instance.$item.getBoundingClientRect();
    const newData = {
      width: clientRect.width,
      height: clientRect.height,
      top: clientRect.top,
      bottom: clientRect.bottom,
      wndW,
      wndH
    };
    const isResized = !oldData || oldData.wndW !== newData.wndW || oldData.wndH !== newData.wndH || oldData.width !== newData.width || oldData.height !== newData.height;
    const isScrolled = isResized || !oldData || oldData.top !== newData.top || oldData.bottom !== newData.bottom;
    jarallaxList[index].oldData = newData;
    if (isResized) {
      instance.onResize();
    }
    if (isScrolled) {
      instance.onScroll();
    }
  });
  global$2.requestAnimationFrame(updateParallax);
}
const visibilityObserver = global$2.IntersectionObserver && new global$2.IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const target = entry.target;
      if (target.jarallax) {
        target.jarallax.isElementInViewport = entry.isIntersecting;
      }
    });
  },
  {
    // Start work slightly before the block enters the viewport to reduce visible jumps.
    rootMargin: "50px"
  }
);
function addObserver(instance) {
  jarallaxList.push({
    instance
  });
  if (jarallaxList.length === 1) {
    global$2.requestAnimationFrame(updateParallax);
  }
  visibilityObserver?.observe(instance.options.elementInViewport || instance.$item);
}
function removeObserver(instance) {
  jarallaxList.forEach((data, key) => {
    if (data.instance.instanceID === instance.instanceID) {
      jarallaxList.splice(key, 1);
    }
  });
  visibilityObserver?.unobserve(instance.options.elementInViewport || instance.$item);
}

let query;
function prefersReducedMotion() {
  if (typeof query === "undefined") {
    query = typeof global$2.matchMedia === "function" ? global$2.matchMedia("(prefers-reduced-motion: reduce)") : null;
  }
  return query?.matches ?? false;
}

const globalNavigator = global$2.navigator ?? { userAgent: "" };
const canUseDOM = typeof document !== "undefined" && typeof Element !== "undefined" && typeof HTMLElement !== "undefined";
let instanceID = 0;
function resolveDisableOption(value) {
  if (typeof value === "string") {
    const regexpMatch = value.match(/^\/(.*)\/([dgimsuvy]*)$/);
    value = regexpMatch ? new RegExp(regexpMatch[1], regexpMatch[2]) : new RegExp(value);
  }
  if (value instanceof RegExp) {
    const regexp = value;
    return () => regexp.test(globalNavigator.userAgent);
  }
  if (typeof value !== "function") {
    return () => value === true;
  }
  return value;
}
class Jarallax {
  constructor(item, userOptions) {
    this.parallaxScrollDistance = 0;
    this.isElementInViewport = false;
    this.instanceID = instanceID;
    instanceID += 1;
    this.$item = item;
    this.defaults = { ...defaults$1 };
    const dataOptions = this.$item.dataset || {};
    const pureDataOptions = {};
    Object.keys(dataOptions).forEach((key) => {
      const lowerCaseOption = key.slice(0, 1).toLowerCase() + key.slice(1);
      if (lowerCaseOption && typeof this.defaults[lowerCaseOption] !== "undefined") {
        pureDataOptions[lowerCaseOption] = dataOptions[key];
      }
    });
    this.options = this.extend(
      {},
      this.defaults,
      pureDataOptions,
      userOptions || {}
    );
    this.pureOptions = this.extend({}, this.options);
    Object.keys(this.options).forEach((key) => {
      const optionKey = key;
      const value = this.options[optionKey];
      if (value === "true") {
        this.options[key] = true;
      } else if (value === "false") {
        this.options[key] = false;
      }
    });
    this.options.speed = Math.min(2, Math.max(-1, parseFloat(`${this.options.speed}`)));
    const disableParallax = resolveDisableOption(
      userOptions?.disableParallax ?? this.options.disableParallax
    );
    this.options.disableParallax = () => prefersReducedMotion() || disableParallax();
    this.options.disableVideo = resolveDisableOption(
      userOptions?.disableVideo ?? this.options.disableVideo
    );
    let elementInVP = this.options.elementInViewport;
    if (elementInVP && typeof elementInVP === "object" && "length" in elementInVP && !(elementInVP instanceof Element)) {
      [elementInVP] = Array.from(elementInVP);
    }
    if (!(elementInVP instanceof Element)) {
      elementInVP = null;
    }
    this.options.elementInViewport = elementInVP;
    this.image = {
      src: this.options.imgSrc || null,
      $container: null,
      useImgTag: false,
      // Fixed positioning remains the default because it matches the historical rendering behavior best.
      position: "fixed"
    };
    if (this.initImg() && this.canInitParallax()) {
      this.init();
    }
  }
  css(el, styles) {
    return css(el, styles);
  }
  extend(out, ...args) {
    return extend$1(out, ...args);
  }
  getWindowData() {
    const { width, height } = getWindowSize();
    return {
      width,
      height,
      y: canUseDOM ? document.documentElement.scrollTop : 0
    };
  }
  initImg() {
    let imageElement = this.options.imgElement;
    if (imageElement && typeof imageElement === "string") {
      imageElement = this.$item.querySelector(imageElement);
    }
    if (!(imageElement instanceof Element)) {
      if (this.options.imgSrc) {
        const image = new Image();
        image.src = this.options.imgSrc;
        imageElement = image;
      } else {
        imageElement = null;
      }
    }
    if (imageElement) {
      if (this.options.keepImg) {
        this.image.$item = imageElement.cloneNode(true);
      } else {
        this.image.$item = imageElement;
        this.image.$itemParent = imageElement.parentNode;
      }
      this.image.useImgTag = true;
    }
    if (this.image.$item) {
      return true;
    }
    if (this.image.src === null) {
      this.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      this.image.bgImage = this.css(this.$item, "background-image");
    }
    return Boolean(this.image.bgImage && this.image.bgImage !== "none");
  }
  canInitParallax() {
    return !this.options.disableParallax();
  }
  init() {
    const containerStyles = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      overflow: "hidden"
    };
    let imageStyles = {
      pointerEvents: "none",
      transformStyle: "preserve-3d",
      backfaceVisibility: "hidden"
    };
    if (!this.options.keepImg) {
      const itemStyle = this.$item.getAttribute("style");
      if (itemStyle) {
        this.$item.setAttribute("data-jarallax-original-styles", itemStyle);
      }
      if (this.image.useImgTag && this.image.$item) {
        const imageStyle = this.image.$item.getAttribute("style");
        if (imageStyle) {
          this.image.$item.setAttribute("data-jarallax-original-styles", imageStyle);
        }
      }
    }
    if (this.css(this.$item, "position") === "static") {
      this.css(this.$item, {
        position: "relative"
      });
    }
    if (this.css(this.$item, "z-index") === "auto") {
      this.css(this.$item, {
        zIndex: 0
      });
    }
    this.image.$container = document.createElement("div");
    this.css(this.image.$container, containerStyles);
    this.css(this.image.$container, {
      zIndex: this.options.zIndex
    });
    if (this.image.position === "fixed") {
      this.css(this.image.$container, {
        WebkitClipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
      });
    }
    this.image.$container.setAttribute("id", `jarallax-container-${this.instanceID}`);
    if (this.options.containerClass) {
      this.image.$container.setAttribute("class", this.options.containerClass);
    }
    this.$item.appendChild(this.image.$container);
    if (this.image.useImgTag && this.image.$item) {
      imageStyles = this.extend(
        {
          objectFit: this.options.imgSize,
          objectPosition: this.options.imgPosition,
          maxWidth: "none"
        },
        containerStyles,
        imageStyles
      );
    } else {
      this.image.$item = document.createElement("div");
      if (this.image.src) {
        imageStyles = this.extend(
          {
            backgroundPosition: this.options.imgPosition,
            backgroundSize: this.options.imgSize,
            backgroundRepeat: this.options.imgRepeat,
            backgroundImage: this.image.bgImage || `url("${this.image.src}")`
          },
          containerStyles,
          imageStyles
        );
      }
    }
    if (this.options.type === "opacity" || this.options.type === "scale" || this.options.type === "scale-opacity" || this.options.speed === 1) {
      this.image.position = "absolute";
    }
    if (this.image.position === "fixed") {
      const parents = getParents(this.$item).filter((el) => {
        const styles = global$2.getComputedStyle(el);
        const parentTransform = styles.getPropertyValue("-webkit-transform") || styles.getPropertyValue("-moz-transform") || styles.transform;
        const overflowRegex = /(auto|scroll)/;
        return parentTransform && parentTransform !== "none" || overflowRegex.test(styles.overflow + styles.overflowY + styles.overflowX);
      });
      this.image.position = parents.length ? "absolute" : "fixed";
    }
    imageStyles.position = this.image.position;
    this.css(this.image.$item, imageStyles);
    this.image.$container.appendChild(this.image.$item);
    this.onResize();
    this.onScroll(true);
    this.options.onInit?.call(this);
    if (this.css(this.$item, "background-image") !== "none") {
      this.css(this.$item, {
        backgroundImage: "none"
      });
    }
    addObserver(this);
  }
  destroy() {
    removeObserver(this);
    const originalStylesTag = this.$item.getAttribute("data-jarallax-original-styles");
    this.$item.removeAttribute("data-jarallax-original-styles");
    if (!originalStylesTag) {
      this.$item.removeAttribute("style");
    } else {
      this.$item.setAttribute("style", originalStylesTag);
    }
    if (this.image.useImgTag && this.image.$item) {
      const originalStylesImgTag = this.image.$item.getAttribute("data-jarallax-original-styles");
      this.image.$item.removeAttribute("data-jarallax-original-styles");
      if (!originalStylesImgTag) {
        this.image.$item.removeAttribute("style");
      } else {
        this.image.$item.setAttribute("style", originalStylesImgTag);
      }
      this.image.$itemParent?.appendChild(this.image.$item);
    }
    if (this.image.$container?.parentNode) {
      this.image.$container.parentNode.removeChild(this.image.$container);
    }
    this.options.onDestroy?.call(this);
    delete this.$item.jarallax;
  }
  coverImage() {
    const { height: wndH } = getWindowSize();
    const rect = this.image.$container.getBoundingClientRect();
    const contH = rect.height;
    const { speed } = this.options;
    const isScroll = this.options.type === "scroll" || this.options.type === "scroll-opacity";
    let scrollDist = 0;
    let resultH = contH;
    if (isScroll) {
      if (speed < 0) {
        scrollDist = speed * Math.max(contH, wndH);
        if (wndH < contH) {
          scrollDist -= speed * (contH - wndH);
        }
      } else {
        scrollDist = speed * (contH + wndH);
      }
      if (speed > 1) {
        resultH = Math.abs(scrollDist - wndH);
      } else if (speed < 0) {
        resultH = scrollDist / speed + Math.abs(scrollDist);
      } else {
        resultH += (wndH - contH) * (1 - speed);
      }
      scrollDist /= 2;
    }
    this.parallaxScrollDistance = scrollDist;
    const resultMT = (isScroll ? wndH - resultH : contH - resultH) / 2;
    this.css(this.image.$item, {
      height: `${resultH}px`,
      marginTop: `${resultMT}px`,
      left: this.image.position === "fixed" ? `${rect.left}px` : "0",
      width: `${rect.width}px`
    });
    this.options.onCoverImage?.call(this);
    return {
      image: {
        height: resultH,
        marginTop: resultMT
      },
      container: rect
    };
  }
  isVisible() {
    return this.isElementInViewport || false;
  }
  onScroll(force) {
    if (!force && !this.isVisible()) {
      return;
    }
    const { height: wndH } = getWindowSize();
    const rect = this.$item.getBoundingClientRect();
    const contT = rect.top;
    const contH = rect.height;
    const styles = {};
    const beforeTop = Math.max(0, contT);
    const beforeTopEnd = Math.max(0, contH + contT);
    const afterTop = Math.max(0, -contT);
    const beforeBottom = Math.max(0, contT + contH - wndH);
    const beforeBottomEnd = Math.max(0, contH - (contT + contH - wndH));
    const afterBottom = Math.max(0, -contT + wndH - contH);
    const fromViewportCenter = 1 - 2 * ((wndH - contT) / (wndH + contH));
    let visiblePercent = 1;
    if (contH < wndH) {
      visiblePercent = 1 - (afterTop || beforeBottom) / contH;
    } else if (beforeTopEnd <= wndH) {
      visiblePercent = beforeTopEnd / wndH;
    } else if (beforeBottomEnd <= wndH) {
      visiblePercent = beforeBottomEnd / wndH;
    }
    if (this.options.type === "opacity" || this.options.type === "scale-opacity" || this.options.type === "scroll-opacity") {
      styles.transform = "translate3d(0,0,0)";
      styles.opacity = visiblePercent;
    }
    if (this.options.type === "scale" || this.options.type === "scale-opacity") {
      let scale = 1;
      if (this.options.speed < 0) {
        scale -= this.options.speed * visiblePercent;
      } else {
        scale += this.options.speed * (1 - visiblePercent);
      }
      styles.transform = `scale(${scale}) translate3d(0,0,0)`;
    }
    if (this.options.type === "scroll" || this.options.type === "scroll-opacity") {
      let positionY = this.parallaxScrollDistance * fromViewportCenter;
      if (this.image.position === "absolute") {
        positionY -= contT;
      }
      styles.transform = `translate3d(0,${positionY}px,0)`;
    }
    this.css(this.image.$item, styles);
    this.options.onScroll?.call(this, {
      section: rect,
      beforeTop,
      beforeTopEnd,
      afterTop,
      beforeBottom,
      beforeBottomEnd,
      afterBottom,
      visiblePercent,
      fromViewportCenter
    });
  }
  onResize() {
    this.coverImage();
  }
}
const jarallax$1 = function jarallax2(items, options, ...args) {
  let normalizedItems = items;
  if (!items) {
    return items;
  }
  if (typeof HTMLElement === "object" ? items instanceof HTMLElement : items && typeof items === "object" && items.nodeType === 1 && typeof items.nodeName === "string") {
    normalizedItems = [items];
  }
  if (!normalizedItems || typeof normalizedItems !== "object" || typeof normalizedItems.length !== "number") {
    return normalizedItems;
  }
  if (!canUseDOM) {
    return typeof options === "string" ? void 0 : normalizedItems;
  }
  let ret;
  for (let index = 0; index < normalizedItems.length; index += 1) {
    const item = normalizedItems[index];
    if (typeof options === "object" || typeof options === "undefined") {
      if (!item.jarallax) {
        item.jarallax = new Jarallax(item, options);
      }
    } else if (item.jarallax) {
      ret = item.jarallax[options].apply(
        item.jarallax,
        args
      );
    }
    if (typeof ret !== "undefined") {
      return ret;
    }
  }
  return normalizedItems;
};
jarallax$1.constructor = Jarallax;

function jarallaxElement$1(jarallax = global$2.jarallax) {
  console.warn(
    "Jarallax Element extension is DEPRECATED, please, avoid using it. We recommend you look at something like `lax.js` library <https://github.com/alexfoxy/lax.js>. It is much more powerful and has a less code (in cases when you don't want to add parallax backgrounds)."
  );
  if (typeof jarallax === "undefined") {
    return;
  }
  const Jarallax = jarallax.constructor;
  [
    "initImg",
    "canInitParallax",
    "init",
    "destroy",
    "coverImage",
    "isVisible",
    "onScroll",
    "onResize"
  ].forEach((key) => {
    const def = Jarallax.prototype[key];
    Jarallax.prototype[key] = function overrideElementMode(...args) {
      if (key === "initImg" && this.$item.getAttribute("data-jarallax-element") !== null) {
        this.options.type = "element";
        this.pureOptions.speed = this.$item.getAttribute("data-jarallax-element") || "100";
      }
      if (this.options.type !== "element") {
        return def.apply(this, args);
      }
      this.pureOptions.threshold = this.$item.getAttribute("data-threshold") || "";
      switch (key) {
        case "init": {
          const speedArr = `${this.pureOptions.speed}`.split(" ");
          this.options.speed = Number(this.pureOptions.speed || 0);
          this.options.speedY = speedArr[0] ? parseFloat(speedArr[0]) : 0;
          this.options.speedX = speedArr[1] ? parseFloat(speedArr[1]) : 0;
          const thresholdArr = `${this.pureOptions.threshold || ""}`.split(" ");
          this.options.thresholdY = thresholdArr[0] ? parseFloat(thresholdArr[0]) : null;
          this.options.thresholdX = thresholdArr[1] ? parseFloat(thresholdArr[1]) : null;
          def.apply(this, args);
          const originalStylesTag = this.$item.getAttribute("data-jarallax-original-styles");
          if (originalStylesTag) {
            this.$item.setAttribute("style", originalStylesTag);
          }
          return true;
        }
        case "onResize": {
          const defTransform = this.css(this.$item, "transform");
          this.css(this.$item, { transform: "" });
          const rect = this.$item.getBoundingClientRect();
          const windowData = this.getWindowData();
          this.itemData = {
            width: rect.width,
            height: rect.height,
            y: rect.top + windowData.y,
            x: rect.left
          };
          this.css(this.$item, { transform: defTransform });
          break;
        }
        case "onScroll": {
          const wnd = this.getWindowData();
          const centerPercent = (wnd.y + wnd.height / 2 - (this.itemData?.y || 0) - (this.itemData?.height || 0) / 2) / (wnd.height / 2);
          const moveY = centerPercent * (this.options.speedY || 0);
          const moveX = centerPercent * (this.options.speedX || 0);
          let my = moveY;
          let mx = moveX;
          if (this.options.thresholdY !== null && typeof this.options.thresholdY !== "undefined" && moveY > this.options.thresholdY) {
            my = 0;
          }
          if (this.options.thresholdX !== null && typeof this.options.thresholdX !== "undefined" && moveX > this.options.thresholdX) {
            mx = 0;
          }
          this.css(this.$item, { transform: `translate3d(${mx}px,${my}px,0)` });
          break;
        }
        case "initImg":
        case "isVisible":
        case "coverImage":
          return true;
      }
      return def.apply(this, args);
    };
  });
}

/*!
 * Video Worker v3.1.0 (https://github.com/nk-o/video-worker)
 * Copyright 2026 nK <https://nkdev.info>
 * Licensed under MIT (https://github.com/nk-o/video-worker/blob/master/LICENSE)
 */

const defaults = {
  autoplay: false,
  loop: false,
  mute: false,
  volume: 100,
  showControls: true,
  accessibilityHidden: false,
  // Origin the player embed is loaded from. Override to use youtube-nocookie.com or a proxy.
  youtubeHost: "https://www.youtube.com",
  vimeoHost: "https://player.vimeo.com",
  // start / end video time in seconds
  startTime: 0,
  endTime: 0
};

function extend(out, ...args) {
  const target = out || {};
  Object.keys(args).forEach((index) => {
    const source = args[Number(index)];
    if (!source) {
      return;
    }
    Object.keys(source).forEach((key) => {
      const typedKey = key;
      const value = source[typedKey];
      if (typeof value !== "undefined") {
        target[typedKey] = value;
      }
    });
  });
  return target;
}

let ID = 0;
class VideoWorkerBase {
  constructor(url, options) {
    this.type = "none";
    this.destroyed = false;
    this.url = url;
    this.options_default = { ...defaults };
    this.options = extend({ ...this.options_default }, options);
    this.videoID = this.constructor.parseURL(url);
    if (this.videoID) {
      this.init();
    }
  }
  isValid() {
    return !!this.videoID;
  }
  init() {
    this.ID = ID;
    ID += 1;
    this.playerID = `VideoWorker-${this.ID}`;
  }
  // events
  on(name, callback) {
    this.userEventsList = this.userEventsList || {};
    if (!this.userEventsList[name]) {
      this.userEventsList[name] = [];
    }
    this.userEventsList[name].push(callback);
  }
  off(name, callback) {
    if (!this.userEventsList || !this.userEventsList[name]) {
      return;
    }
    if (!callback) {
      delete this.userEventsList[name];
      return;
    }
    this.userEventsList[name].forEach((value, key) => {
      var _a;
      if (value === callback) {
        const eventList = (_a = this.userEventsList) == null ? void 0 : _a[name];
        if (eventList) {
          eventList[key] = false;
        }
      }
    });
  }
  fire(name, ...args) {
    if (this.userEventsList && typeof this.userEventsList[name] !== "undefined") {
      this.userEventsList[name].forEach((value) => {
        if (value) {
          value.apply(this, args);
        }
      });
    }
  }
  /**
   * Methods used in providers.
   */
  static parseURL(_url) {
    return false;
  }
  play(_start) {
  }
  pause() {
  }
  mute() {
  }
  unmute() {
  }
  setVolume(_volume = false) {
  }
  getVolume(_callback) {
  }
  getMuted(_callback) {
  }
  setCurrentTime(_currentTime = false) {
  }
  getCurrentTime(_callback) {
  }
  getImageURL(_callback) {
  }
  getVideo(_callback) {
  }
  destroy() {
    var _a, _b;
    this.destroyed = true;
    this.userEventsList = void 0;
    if ((_a = this.$video) == null ? void 0 : _a.parentNode) {
      this.$video.parentNode.removeChild(this.$video);
    }
    if ((_b = this.hiddenContainer) == null ? void 0 : _b.parentNode) {
      this.hiddenContainer.parentNode.removeChild(this.hiddenContainer);
    }
    this.player = void 0;
    this.$video = void 0;
    this.hiddenContainer = void 0;
  }
}

class VideoWorkerLocal extends VideoWorkerBase {
  constructor() {
    super(...arguments);
    this.type = "local";
  }
  static parseURL(url) {
    const videoFormats = url.split(/,(?=mp4:|webm:|ogv:|ogg:)/);
    const result = {};
    let ready = 0;
    videoFormats.forEach((value) => {
      const match = value.match(/^(mp4|webm|ogv|ogg):(.*)/);
      if ((match == null ? void 0 : match[1]) && match[2]) {
        const key = match[1] === "ogv" ? "ogg" : match[1];
        result[key] = match[2];
        ready = 1;
      }
    });
    return ready ? result : false;
  }
  play(start) {
    if (!this.player) {
      return;
    }
    if (typeof start !== "undefined") {
      this.player.currentTime = start;
    }
    if (this.player.paused) {
      if (this.options.endTime && !this.options.loop) {
        this.getCurrentTime((seconds) => {
          var _a;
          if (seconds < this.options.endTime) {
            void ((_a = this.player) == null ? void 0 : _a.play());
          }
        });
      } else {
        void this.player.play();
      }
    }
  }
  pause() {
    if (!this.player || this.player.paused) {
      return;
    }
    this.player.pause();
  }
  mute() {
    if (!this.player || !this.$video) {
      return;
    }
    this.$video.muted = true;
  }
  unmute() {
    if (!this.player || !this.$video) {
      return;
    }
    this.$video.muted = false;
  }
  setVolume(volume = false) {
    if (!this.player || !this.$video || typeof volume !== "number") {
      return;
    }
    this.$video.volume = volume / 100;
  }
  getVolume(callback) {
    if (!this.player || !this.$video) {
      callback(false);
      return;
    }
    callback(this.$video.volume * 100);
  }
  getMuted(callback) {
    if (!this.player || !this.$video) {
      callback(null);
      return;
    }
    callback(this.$video.muted);
  }
  setCurrentTime(currentTime = false) {
    if (!this.player || !this.$video || typeof currentTime !== "number") {
      return;
    }
    this.$video.currentTime = currentTime;
  }
  getCurrentTime(callback) {
    if (!this.player) {
      return;
    }
    callback(this.player.currentTime);
  }
  getImageURL(callback) {
    if (this.videoImage) {
      callback(this.videoImage);
    }
  }
  getVideo(callback) {
    if (this.destroyed) {
      return;
    }
    if (this.$video) {
      callback(this.$video);
      return;
    }
    let hiddenDiv;
    if (!this.$video) {
      hiddenDiv = document.createElement("div");
      hiddenDiv.style.display = "none";
    }
    function addSourceElement(element, src, type) {
      const source = document.createElement("source");
      source.src = src;
      source.type = type;
      element.appendChild(source);
    }
    if (!this.$video && hiddenDiv) {
      this.$video = document.createElement("video");
      this.player = this.$video;
      this.hiddenContainer = hiddenDiv;
      if (this.options.showControls) {
        this.$video.controls = true;
      }
      if (typeof this.options.volume === "number") {
        this.setVolume(this.options.volume);
      }
      if (this.options.mute) {
        this.mute();
      }
      if (this.options.loop) {
        this.$video.loop = true;
      }
      this.$video.setAttribute("playsinline", "");
      this.$video.setAttribute("webkit-playsinline", "");
      if (this.options.accessibilityHidden) {
        this.$video.setAttribute("tabindex", "-1");
        this.$video.setAttribute("aria-hidden", "true");
      }
      this.$video.setAttribute("id", this.playerID);
      hiddenDiv.appendChild(this.$video);
      document.body.appendChild(hiddenDiv);
      Object.keys(this.videoID).forEach((key) => {
        const sourceValue = this.videoID[key];
        if (sourceValue) {
          addSourceElement(this.$video, sourceValue, `video/${key}`);
        }
      });
      const player = this.player;
      let localStarted = false;
      this.eventHandlers = {
        playing: (event) => {
          if (!localStarted) {
            this.fire("started", event);
          }
          localStarted = true;
        },
        timeupdate: (event) => {
          this.fire("timeupdate", event);
          if (this.options.endTime && this.player && this.player.currentTime >= this.options.endTime) {
            if (this.options.loop) {
              this.play(this.options.startTime);
            } else {
              this.pause();
            }
          }
        },
        play: (event) => {
          this.fire("play", event);
        },
        pause: (event) => {
          this.fire("pause", event);
        },
        ended: (event) => {
          this.fire("ended", event);
        },
        loadedmetadata: (event) => {
          if (!this.player) {
            return;
          }
          this.videoWidth = this.player.videoWidth || 1280;
          this.videoHeight = this.player.videoHeight || 720;
          this.fire("ready", event);
          if (this.options.autoplay) {
            this.play(this.options.startTime);
          }
        },
        volumechange: (event) => {
          this.getVolume((volume) => {
            if (typeof volume === "number") {
              this.options.volume = volume;
            }
          });
          this.fire("volumechange", event);
        },
        error: (event) => {
          this.fire("error", event);
        }
      };
      player.addEventListener("playing", this.eventHandlers.playing);
      player.addEventListener("timeupdate", this.eventHandlers.timeupdate);
      player.addEventListener("play", this.eventHandlers.play);
      player.addEventListener("pause", this.eventHandlers.pause);
      player.addEventListener("ended", this.eventHandlers.ended);
      player.addEventListener("loadedmetadata", this.eventHandlers.loadedmetadata);
      player.addEventListener("volumechange", this.eventHandlers.volumechange);
      player.addEventListener("error", this.eventHandlers.error);
    }
    callback(this.$video);
  }
  destroy() {
    if (this.player && this.eventHandlers) {
      this.player.removeEventListener("playing", this.eventHandlers.playing);
      this.player.removeEventListener("timeupdate", this.eventHandlers.timeupdate);
      this.player.removeEventListener("play", this.eventHandlers.play);
      this.player.removeEventListener("pause", this.eventHandlers.pause);
      this.player.removeEventListener("ended", this.eventHandlers.ended);
      this.player.removeEventListener("loadedmetadata", this.eventHandlers.loadedmetadata);
      this.player.removeEventListener("volumechange", this.eventHandlers.volumechange);
      this.player.removeEventListener("error", this.eventHandlers.error);
    }
    this.eventHandlers = void 0;
    super.destroy();
  }
}

class Deferred {
  constructor() {
    this.doneCallbacks = [];
    this.failCallbacks = [];
  }
  execute(list, args) {
    let index = list.length;
    while (index) {
      index -= 1;
      list[index](...args);
    }
  }
  resolve(...args) {
    this.execute(this.doneCallbacks, args);
  }
  reject(...args) {
    this.execute(this.failCallbacks, args);
  }
  done(callback) {
    this.doneCallbacks.push(callback);
  }
  fail(callback) {
    this.failCallbacks.push(callback);
  }
}

let win;
if (typeof window !== "undefined") {
  win = window;
} else if (typeof self !== "undefined") {
  win = self;
} else {
  win = globalThis;
}
var global$1 = win;

function trimTrailingSlash(url) {
  return url.replace(/\/+$/, "");
}

const VIMEO_IFRAME_ALLOW = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
let VimeoAPIadded = 0;
let loadingVimeoPlayer = 0;
const loadingVimeoDefer = new Deferred();
const videoGlobal$1 = global$1;
function loadAPI$1() {
  if (VimeoAPIadded) {
    return;
  }
  VimeoAPIadded = 1;
  if (typeof videoGlobal$1.Vimeo !== "undefined") {
    return;
  }
  const src = "https://player.vimeo.com/api/player.js";
  let tag = document.createElement("script");
  let head = document.getElementsByTagName("head")[0] || null;
  if (!head || !tag) {
    return;
  }
  tag.src = src;
  head.appendChild(tag);
  head = null;
  tag = null;
}
function onAPIready$1(callback) {
  if (typeof videoGlobal$1.Vimeo === "undefined" && !loadingVimeoPlayer) {
    loadingVimeoPlayer = 1;
    const vimeoInterval = setInterval(() => {
      if (typeof videoGlobal$1.Vimeo !== "undefined") {
        clearInterval(vimeoInterval);
        loadingVimeoDefer.resolve("done");
        callback();
      }
    }, 20);
  } else if (typeof videoGlobal$1.Vimeo !== "undefined") {
    callback();
  } else {
    loadingVimeoDefer.done(() => {
      callback();
    });
  }
}
class VideoWorkerVimeo extends VideoWorkerBase {
  constructor() {
    super(...arguments);
    this.type = "vimeo";
  }
  static parseURL(url) {
    const regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const match = url.match(regExp);
    return (match == null ? void 0 : match[3]) ? match[3] : false;
  }
  // Try to extract a hash for private videos from the URL.
  // Thanks to https://github.com/sampotts/plyr
  static parseURLHash(url) {
    const regex = /^.*(vimeo.com\/|video\/)(\d+)(\?.*&*h=|\/)+([\d,a-f]+)/;
    const found = url.match(regex);
    return found && found.length === 5 ? found[4] : null;
  }
  init() {
    super.init();
    loadAPI$1();
  }
  play(start) {
    if (!this.player) {
      return;
    }
    if (typeof start !== "undefined") {
      void this.player.setCurrentTime(start);
    }
    this.player.getPaused().then((paused) => {
      var _a;
      if (paused) {
        if (this.options.endTime && !this.options.loop) {
          this.getCurrentTime((seconds) => {
            var _a2;
            if (seconds < this.options.endTime) {
              void ((_a2 = this.player) == null ? void 0 : _a2.play());
            }
          });
        } else {
          void ((_a = this.player) == null ? void 0 : _a.play());
        }
      }
    });
  }
  pause() {
    if (!this.player) {
      return;
    }
    this.player.getPaused().then((paused) => {
      var _a;
      if (!paused) {
        void ((_a = this.player) == null ? void 0 : _a.pause());
      }
    });
  }
  mute() {
    if (!this.player || !this.player.setVolume) {
      return;
    }
    this.setVolume(0);
  }
  unmute() {
    if (!this.player || !this.player.setVolume) {
      return;
    }
    this.setVolume(this.options.volume || 100);
  }
  setVolume(volume = false) {
    if (!this.player || typeof volume !== "number" || !this.player.setVolume) {
      return;
    }
    void this.player.setVolume(volume / 100);
  }
  getVolume(callback) {
    if (!this.player) {
      callback(false);
      return;
    }
    if (this.player.getVolume) {
      this.player.getVolume().then((volume) => {
        callback(volume * 100);
      });
    }
  }
  getMuted(callback) {
    if (!this.player) {
      callback(null);
      return;
    }
    if (this.player.getVolume) {
      this.player.getVolume().then((volume) => {
        callback(volume === 0);
      });
    }
  }
  setCurrentTime(currentTime = false) {
    if (!this.player || typeof currentTime !== "number" || !this.player.setCurrentTime) {
      return;
    }
    void this.player.setCurrentTime(currentTime);
  }
  getCurrentTime(callback) {
    if (!this.player || !this.player.getCurrentTime) {
      return;
    }
    this.player.getCurrentTime().then((currentTime) => {
      callback(currentTime);
    });
  }
  getImageURL(callback) {
    if (this.destroyed) {
      return;
    }
    if (this.videoImage) {
      callback(this.videoImage);
      return;
    }
    let width = global$1.innerWidth || 1920;
    if (global$1.devicePixelRatio) {
      width *= global$1.devicePixelRatio;
    }
    width = Math.min(width, 1920);
    const request = new XMLHttpRequest();
    this.imageRequest = request;
    request.open("GET", `https://vimeo.com/api/oembed.json?url=${this.url}&width=${width}`, true);
    request.onreadystatechange = () => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status >= 200 && request.status < 400) {
        const response = JSON.parse(request.responseText);
        if (response.thumbnail_url) {
          this.videoImage = response.thumbnail_url;
          callback(this.videoImage);
        }
      }
      this.imageRequest = void 0;
    };
    request.send();
  }
  getVideo(callback) {
    if (this.destroyed) {
      return;
    }
    if (this.$video) {
      callback(this.$video);
      return;
    }
    onAPIready$1(() => {
      if (this.destroyed) {
        return;
      }
      let hiddenDiv;
      if (!this.$video) {
        hiddenDiv = document.createElement("div");
        hiddenDiv.style.display = "none";
      }
      this.playerOptions = {
        // GDPR Compliance.
        dnt: 1,
        id: String(this.videoID),
        autopause: 0,
        transparent: 0,
        autoplay: this.options.autoplay ? 1 : 0,
        loop: this.options.loop ? 1 : 0,
        muted: this.options.mute || this.options.volume === 0 ? 1 : 0
      };
      const urlHash = this.constructor.parseURLHash(this.url);
      if (urlHash) {
        this.playerOptions.h = urlHash;
      }
      if (!this.options.showControls) {
        this.playerOptions.controls = 0;
      }
      if (!this.options.showControls && this.options.loop && this.options.autoplay) {
        this.playerOptions.background = 1;
      }
      if (!this.$video && hiddenDiv) {
        this.hiddenContainer = hiddenDiv;
        let playerOptionsString = "";
        Object.keys(this.playerOptions).forEach((key) => {
          var _a;
          const optionKey = key;
          const value = (_a = this.playerOptions) == null ? void 0 : _a[optionKey];
          if (typeof value === "undefined") {
            return;
          }
          if (playerOptionsString !== "") {
            playerOptionsString += "&";
          }
          playerOptionsString += `${key}=${encodeURIComponent(String(value))}`;
        });
        this.$video = document.createElement("iframe");
        this.$video.setAttribute("id", this.playerID);
        this.$video.setAttribute(
          "src",
          `${trimTrailingSlash(this.options.vimeoHost)}/video/${String(this.videoID)}?${playerOptionsString}`
        );
        this.$video.setAttribute("frameborder", "0");
        this.$video.setAttribute("mozallowfullscreen", "");
        this.$video.setAttribute("allowfullscreen", "");
        this.$video.setAttribute("allow", VIMEO_IFRAME_ALLOW);
        this.$video.setAttribute("title", "Vimeo video player");
        if (this.options.accessibilityHidden) {
          this.$video.setAttribute("tabindex", "-1");
          this.$video.setAttribute("aria-hidden", "true");
        }
        hiddenDiv.appendChild(this.$video);
        document.body.appendChild(hiddenDiv);
      }
      this.player = this.player || new videoGlobal$1.Vimeo.Player(
        this.$video,
        this.playerOptions
      );
      if (!this.options.mute && typeof this.options.volume === "number") {
        this.setVolume(this.options.volume);
      }
      if (this.options.startTime && this.options.autoplay) {
        void this.player.setCurrentTime(this.options.startTime);
      }
      this.player.getVideoWidth().then((widthValue) => {
        this.videoWidth = widthValue || 1280;
      });
      this.player.getVideoHeight().then((heightValue) => {
        this.videoHeight = heightValue || 720;
      });
      let vmStarted = false;
      this.player.on("timeupdate", (event) => {
        if (!vmStarted) {
          this.fire("started", event);
          vmStarted = true;
        }
        this.fire("timeupdate", event);
        if (this.options.endTime && event.seconds >= this.options.endTime) {
          if (this.options.loop) {
            this.play(this.options.startTime);
          } else {
            this.pause();
          }
        }
      });
      this.player.on("play", (event) => {
        this.fire("play", event);
        if (this.options.startTime && event.seconds === 0) {
          this.play(this.options.startTime);
        }
      });
      this.player.on("pause", (event) => {
        this.fire("pause", event);
      });
      this.player.on("ended", (event) => {
        this.fire("ended", event);
      });
      this.player.on("loaded", (event) => {
        this.fire("ready", event);
      });
      this.player.on("volumechange", (event) => {
        this.getVolume((volume) => {
          if (typeof volume === "number") {
            this.options.volume = volume;
          }
        });
        this.fire("volumechange", event);
      });
      this.player.on("error", (event) => {
        this.fire("error", event);
      });
      callback(this.$video);
    });
  }
  destroy() {
    var _a;
    if (this.imageRequest) {
      this.imageRequest.abort();
      this.imageRequest = void 0;
    }
    if ((_a = this.player) == null ? void 0 : _a.destroy) {
      void this.player.destroy();
    }
    super.destroy();
  }
}

let YoutubeAPIadded = 0;
let loadingYoutubePlayer = 0;
const loadingYoutubeDefer = new Deferred();
const videoGlobal = global$1;
function loadAPI() {
  if (YoutubeAPIadded) {
    return;
  }
  YoutubeAPIadded = 1;
  const src = "https://www.youtube.com/iframe_api";
  let tag = document.createElement("script");
  let head = document.getElementsByTagName("head")[0] || null;
  if (!head || !tag) {
    return;
  }
  tag.src = src;
  head.appendChild(tag);
  head = null;
  tag = null;
}
function onAPIready(callback) {
  if ((typeof videoGlobal.YT === "undefined" || videoGlobal.YT.loaded === 0) && !loadingYoutubePlayer) {
    loadingYoutubePlayer = 1;
    videoGlobal.onYouTubeIframeAPIReady = () => {
      videoGlobal.onYouTubeIframeAPIReady = null;
      loadingYoutubeDefer.resolve("done");
      callback();
    };
  } else if (typeof videoGlobal.YT === "object" && videoGlobal.YT.loaded === 1) {
    callback();
  } else {
    loadingYoutubeDefer.done(() => {
      callback();
    });
  }
}
class VideoWorkerYoutube extends VideoWorkerBase {
  constructor() {
    super(...arguments);
    this.type = "youtube";
  }
  static parseURL(url) {
    const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : false;
  }
  init() {
    super.init();
    loadAPI();
  }
  play(start) {
    if (!this.player || !this.player.playVideo || !videoGlobal.YT) {
      return;
    }
    if (typeof start !== "undefined") {
      this.player.seekTo(start || 0);
    }
    if (videoGlobal.YT.PlayerState.PLAYING !== this.player.getPlayerState()) {
      if (this.options.endTime && !this.options.loop) {
        this.getCurrentTime((seconds) => {
          var _a;
          if (seconds < this.options.endTime) {
            (_a = this.player) == null ? void 0 : _a.playVideo();
          }
        });
      } else {
        this.player.playVideo();
      }
    }
  }
  pause() {
    if (!this.player || !this.player.pauseVideo || !videoGlobal.YT) {
      return;
    }
    if (videoGlobal.YT.PlayerState.PLAYING === this.player.getPlayerState()) {
      this.player.pauseVideo();
    }
  }
  mute() {
    if (!this.player || !this.player.mute) {
      return;
    }
    this.player.mute();
  }
  unmute() {
    if (!this.player || !this.player.unMute) {
      return;
    }
    this.player.unMute();
  }
  setVolume(volume = false) {
    if (!this.player || typeof volume !== "number" || !this.player.setVolume) {
      return;
    }
    this.player.setVolume(volume);
  }
  getVolume(callback) {
    if (!this.player) {
      callback(false);
      return;
    }
    if (this.player.getVolume) {
      callback(this.player.getVolume());
    }
  }
  getMuted(callback) {
    if (!this.player) {
      callback(null);
      return;
    }
    if (this.player.isMuted) {
      callback(this.player.isMuted());
    }
  }
  setCurrentTime(currentTime = false) {
    if (!this.player || typeof currentTime !== "number" || !this.player.seekTo) {
      return;
    }
    this.player.seekTo(currentTime);
  }
  getCurrentTime(callback) {
    if (!this.player || !this.player.getCurrentTime) {
      return;
    }
    callback(this.player.getCurrentTime());
  }
  // Time the progress check stops the video at. A looped video restarts right before its
  // natural end, so the player never switches to the ENDED state and never shows its own UI
  // over the video. getDuration() alone is not enough for that: it returns 0 until the video
  // metadata is loaded and is sometimes rounded up to the next second.
  // https://github.com/nk-o/video-worker/issues/2
  getEndTime() {
    var _a;
    if (this.options.endTime || !this.options.loop) {
      return this.options.endTime;
    }
    const duration = this.observedDuration || ((_a = this.player) == null ? void 0 : _a.getDuration()) || 0;
    return duration > 0.3 ? duration - 0.3 : 0;
  }
  getImageURL(callback) {
    if (this.videoImage) {
      callback(this.videoImage);
      return;
    }
    const availableSizes = ["maxresdefault", "sddefault", "hqdefault", "0"];
    let step = 0;
    const tempImg = new Image();
    tempImg.onload = () => {
      if ((tempImg.naturalWidth || tempImg.width) !== 120 || step === availableSizes.length - 1) {
        this.videoImage = `https://img.youtube.com/vi/${String(this.videoID)}/${availableSizes[step]}.jpg`;
        callback(this.videoImage);
      } else {
        step += 1;
        tempImg.src = `https://img.youtube.com/vi/${String(this.videoID)}/${availableSizes[step]}.jpg`;
      }
    };
    tempImg.src = `https://img.youtube.com/vi/${String(this.videoID)}/${availableSizes[step]}.jpg`;
  }
  getVideo(callback) {
    if (this.destroyed) {
      return;
    }
    if (this.$video) {
      callback(this.$video);
      return;
    }
    onAPIready(() => {
      if (this.destroyed) {
        return;
      }
      let hiddenDiv;
      if (!this.$video) {
        hiddenDiv = document.createElement("div");
        hiddenDiv.style.display = "none";
      }
      this.playerOptions = {
        host: trimTrailingSlash(this.options.youtubeHost),
        videoId: String(this.videoID),
        playerVars: {
          autohide: 1,
          rel: 0,
          autoplay: 0,
          // autoplay enable on mobile devices
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            if (this.options.mute) {
              event.target.mute();
            } else if (typeof this.options.volume === "number") {
              event.target.setVolume(this.options.volume);
            }
            if (this.options.autoplay) {
              this.play(this.options.startTime);
            }
            this.fire("ready", event);
            if (this.volumeChangeInterval) {
              clearInterval(this.volumeChangeInterval);
            }
            this.volumeChangeInterval = setInterval(() => {
              this.getVolume((volume) => {
                if (typeof volume === "number" && this.options.volume !== volume) {
                  this.options.volume = volume;
                  this.fire("volumechange", event);
                }
              });
            }, 150);
          },
          onStateChange: () => {
          },
          onError: (event) => {
            this.fire("error", event);
          }
        }
      };
      if (!this.options.showControls) {
        this.playerOptions.playerVars.iv_load_policy = 3;
        this.playerOptions.playerVars.modestbranding = 1;
        this.playerOptions.playerVars.controls = 0;
        this.playerOptions.playerVars.showinfo = 0;
        this.playerOptions.playerVars.disablekb = 1;
      }
      let ytStarted = false;
      this.playerOptions.events.onStateChange = (event) => {
        if (!videoGlobal.YT || !this.player) {
          return;
        }
        if (event.data === videoGlobal.YT.PlayerState.ENDED) {
          this.observedDuration = this.player.getCurrentTime();
          if (this.options.loop) {
            this.play(this.options.startTime);
          }
        }
        if (!ytStarted && event.data === videoGlobal.YT.PlayerState.PLAYING) {
          ytStarted = true;
          this.fire("started", event);
        }
        if (event.data === videoGlobal.YT.PlayerState.PLAYING) {
          this.fire("play", event);
        }
        if (event.data === videoGlobal.YT.PlayerState.PAUSED) {
          this.fire("pause", event);
        }
        if (event.data === videoGlobal.YT.PlayerState.ENDED) {
          this.fire("ended", event);
        }
        if (event.data === videoGlobal.YT.PlayerState.PLAYING) {
          if (this.progressInterval) {
            clearInterval(this.progressInterval);
          }
          this.progressInterval = setInterval(() => {
            if (!this.player) {
              return;
            }
            this.fire("timeupdate", event);
            const endTime = this.getEndTime();
            if (endTime && this.player.getCurrentTime() >= endTime) {
              if (this.options.loop) {
                this.play(this.options.startTime);
              } else {
                this.pause();
              }
            }
          }, 150);
        } else if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = void 0;
        }
      };
      const firstInit = !this.$video;
      if (firstInit && hiddenDiv) {
        this.hiddenContainer = hiddenDiv;
        const div = document.createElement("div");
        div.setAttribute("id", this.playerID);
        hiddenDiv.appendChild(div);
        document.body.appendChild(hiddenDiv);
      }
      this.player = this.player || new videoGlobal.YT.Player(this.playerID, this.playerOptions);
      if (firstInit) {
        this.$video = document.getElementById(this.playerID);
        if (this.$video && this.options.accessibilityHidden) {
          this.$video.setAttribute("tabindex", "-1");
          this.$video.setAttribute("aria-hidden", "true");
        }
        if (this.$video) {
          this.videoWidth = parseInt(this.$video.getAttribute("width") || "1280", 10) || 1280;
          this.videoHeight = parseInt(this.$video.getAttribute("height") || "720", 10) || 720;
        }
      }
      callback(this.$video);
    });
  }
  destroy() {
    var _a;
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = void 0;
    }
    if (this.volumeChangeInterval) {
      clearInterval(this.volumeChangeInterval);
      this.volumeChangeInterval = void 0;
    }
    if ((_a = this.player) == null ? void 0 : _a.destroy) {
      this.player.destroy();
    }
    super.destroy();
  }
}

const VideoWorker = function(url, options) {
  let result = false;
  Object.keys(VideoWorker.providers).forEach((key) => {
    if (!result && VideoWorker.providers[key].parseURL(url)) {
      result = new VideoWorker.providers[key](url, options);
    }
  });
  return result || new VideoWorkerBase(url, options);
};
VideoWorker.BaseClass = VideoWorkerBase;
VideoWorker.providers = {
  Youtube: VideoWorkerYoutube,
  Vimeo: VideoWorkerVimeo,
  Local: VideoWorkerLocal
};

function isPosterOnlyVideo(instance) {
  return prefersReducedMotion() && instance.video?.type === "local" && !instance.defaultInitImgResult;
}
function jarallaxVideo$1(jarallax = global$2.jarallax) {
  if (typeof jarallax === "undefined") {
    return;
  }
  const Jarallax = jarallax.constructor;
  const defOnScroll = Jarallax.prototype.onScroll;
  Jarallax.prototype.onScroll = function onScrollWithVideo() {
    defOnScroll.apply(this);
    const posterOnly = isPosterOnlyVideo(this);
    const isReady = !this.isVideoInserted && this.video && (!this.options.videoLazyLoading || this.isElementInViewport) && !this.options.disableVideo() && (!prefersReducedMotion() || posterOnly);
    if (!isReady) {
      return;
    }
    this.isVideoInserted = true;
    this.video?.getVideo((video) => {
      const insertedVideo = video;
      const parent = insertedVideo.parentNode;
      this.css(insertedVideo, {
        position: this.image.position,
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        width: "100%",
        height: "100%",
        maxWidth: "none",
        maxHeight: "none",
        pointerEvents: "none",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        margin: 0,
        zIndex: -1
      });
      this.$video = insertedVideo;
      if (this.video?.type === "local") {
        if (posterOnly) {
          this.css(insertedVideo, { objectFit: "cover" });
        } else if (this.image.src) {
          insertedVideo.setAttribute("poster", this.image.src);
        } else if (this.image.$item?.tagName === "IMG") {
          insertedVideo.setAttribute("poster", this.image.$item.src);
        }
      }
      if (this.options.videoClass) {
        insertedVideo.setAttribute(
          "class",
          `${this.options.videoClass} ${this.options.videoClass}-${this.video?.type}`
        );
      }
      this.image.$container?.appendChild(insertedVideo);
      parent?.parentNode?.removeChild(parent);
      this.options.onVideoInsert?.call(this);
    });
  };
  const defCoverImage = Jarallax.prototype.coverImage;
  Jarallax.prototype.coverImage = function coverVideo() {
    const imageData = defCoverImage.apply(this);
    const node = this.image.$item?.nodeName;
    if (!imageData || imageData === true || !this.video || !node || node !== "IFRAME" && node !== "VIDEO" || !this.$video) {
      return imageData;
    }
    let h = imageData.image.height;
    let w = h * (this.image.width || 0) / (this.image.height || 1);
    let ml = (imageData.container.width - w) / 2;
    let mt = imageData.image.marginTop;
    if (imageData.container.width > w) {
      w = imageData.container.width;
      h = w * (this.image.height || 0) / (this.image.width || 1);
      ml = 0;
      mt += (imageData.image.height - h) / 2;
    }
    if (node === "IFRAME") {
      h += 400;
      mt -= 200;
    }
    this.css(this.$video, {
      width: `${w}px`,
      marginLeft: `${ml}px`,
      height: `${h}px`,
      marginTop: `${mt}px`
    });
    return imageData;
  };
  const defInitImg = Jarallax.prototype.initImg;
  Jarallax.prototype.initImg = function initVideoImage() {
    const defaultResult = defInitImg.apply(this);
    if (!this.options.videoSrc) {
      this.options.videoSrc = this.$item.getAttribute("data-jarallax-video") || null;
    }
    if (this.options.videoSrc) {
      this.defaultInitImgResult = defaultResult;
      return true;
    }
    return defaultResult;
  };
  const defCanInitParallax = Jarallax.prototype.canInitParallax;
  Jarallax.prototype.canInitParallax = function canInitVideoParallax() {
    let defaultResult = defCanInitParallax.apply(this);
    if (!this.options.videoSrc) {
      return defaultResult;
    }
    const video = new VideoWorker(this.options.videoSrc, {
      // Self-hosted players autoplay themselves once metadata lands, so this is what keeps a
      // poster-only video paused.
      autoplay: !prefersReducedMotion(),
      loop: this.options.videoLoop,
      showControls: false,
      accessibilityHidden: true,
      startTime: Number(this.options.videoStartTime || 0),
      endTime: Number(this.options.videoEndTime || 0),
      // `data-video-volume` reaches us as a string, and "0" is truthy. Compare the number.
      mute: !Number(this.options.videoVolume),
      volume: Number(this.options.videoVolume || 0),
      // video-worker ignores undefined, so an unset host keeps its own default.
      youtubeHost: this.options.videoYoutubeHost || void 0,
      vimeoHost: this.options.videoVimeoHost || void 0
    });
    this.options.onVideoWorkerInit?.call(this, video);
    const resetDefaultImage = () => {
      if (this.image.$default_item) {
        this.image.$item = this.image.$default_item;
        this.image.$item.style.display = "block";
        this.coverImage();
        this.onScroll();
      }
    };
    if (!video.isValid()) {
      return defaultResult;
    }
    if (this.options.disableParallax()) {
      defaultResult = true;
      this.image.position = "absolute";
      this.options.type = "scroll";
      this.options.speed = 1;
    }
    if (!defaultResult) {
      if (!this.defaultInitImgResult) {
        video.getImageURL((url) => {
          const currentStyle = this.$item.getAttribute("style");
          if (currentStyle) {
            this.$item.setAttribute("data-jarallax-original-styles", currentStyle);
          }
          this.css(this.$item, {
            backgroundImage: `url("${url}")`,
            backgroundPosition: "center",
            backgroundSize: "cover"
          });
        });
      }
      return defaultResult;
    }
    video.on("ready", () => {
      if (prefersReducedMotion()) {
        return;
      }
      if (this.options.videoPlayOnlyVisible) {
        const oldOnScroll = this.onScroll;
        this.onScroll = function onScrollPlayVideo() {
          oldOnScroll.apply(this);
          if (!this.videoError && (this.options.videoLoop || !this.options.videoLoop && !this.videoEnded)) {
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
    video.on("started", () => {
      this.image.$default_item = this.image.$item;
      this.image.$item = this.$video;
      this.image.width = this.video?.videoWidth || 1280;
      this.image.height = this.video?.videoHeight || 720;
      this.coverImage();
      this.onScroll();
      if (this.image.$default_item) {
        this.image.$default_item.style.display = "none";
      }
    });
    video.on("ended", () => {
      this.videoEnded = true;
      if (!this.options.videoLoop) {
        resetDefaultImage();
      }
    });
    video.on("error", () => {
      this.videoError = true;
      resetDefaultImage();
    });
    this.video = video;
    if (!this.defaultInitImgResult) {
      this.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      if (video.type !== "local") {
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
  Jarallax.prototype.destroy = function destroyVideo() {
    if (this.image.$default_item) {
      this.image.$item = this.image.$default_item;
      delete this.image.$default_item;
    }
    defDestroy.apply(this);
  };
}

const jarallax = jarallax$1;
const jarallaxVideo = function jarallaxVideo2() {
  jarallaxVideo$1(jarallax);
};
const jarallaxElement = function jarallaxElement2() {
  jarallaxElement$1(jarallax);
};

exports.jarallax = jarallax;
exports.jarallaxElement = jarallaxElement;
exports.jarallaxVideo = jarallaxVideo;
//# sourceMappingURL=jarallax.cjs.map
