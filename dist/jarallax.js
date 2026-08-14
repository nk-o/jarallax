/*!
 * Jarallax v3.1.0 (https://github.com/nk-o/jarallax)
 * Copyright 2026 nK <https://nkdev.info>
 * Licensed under MIT (https://github.com/nk-o/jarallax/blob/master/LICENSE)
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.jarallax = factory());
})(this, (function () { 'use strict';

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

  let win;
  if (typeof window !== "undefined") {
    win = window;
  } else if (typeof global !== "undefined") {
    win = global;
  } else if (typeof self !== "undefined") {
    win = self;
  } else {
    win = {};
  }
  var global$1 = win;

  const defaults = {
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

  function css(el, styles) {
    if (typeof styles === "string") {
      return global$1.getComputedStyle(el).getPropertyValue(styles);
    }
    Object.keys(styles).forEach((key) => {
      el.style[key] = styles[key];
    });
    return el;
  }

  function extend(out, ...args) {
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

  const mobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    global$1.navigator?.userAgent ?? ""
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
      return global$1.innerHeight || 0;
    }
    if (!deviceHelper && document.body) {
      deviceHelper = document.createElement("div");
      deviceHelper.style.cssText = "position: fixed; top: -9999px; left: 0; height: 100vh; width: 0;";
      document.body.appendChild(deviceHelper);
    }
    return (deviceHelper ? deviceHelper.clientHeight : 0) || global$1.innerHeight || document.documentElement.clientHeight;
  }
  function updateWindowHeight() {
    if (!hasDocument()) {
      wndW = global$1.innerWidth || 0;
      wndH = global$1.innerHeight || 0;
      return;
    }
    wndW = global$1.innerWidth || document.documentElement.clientWidth;
    wndH = isMobile() ? getDeviceHeight() : global$1.innerHeight || document.documentElement.clientHeight;
  }
  updateWindowHeight();
  global$1.addEventListener?.("resize", updateWindowHeight);
  global$1.addEventListener?.("orientationchange", updateWindowHeight);
  global$1.addEventListener?.("load", updateWindowHeight);
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
    global$1.requestAnimationFrame(updateParallax);
  }
  const visibilityObserver = global$1.IntersectionObserver && new global$1.IntersectionObserver(
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
      global$1.requestAnimationFrame(updateParallax);
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
      query = typeof global$1.matchMedia === "function" ? global$1.matchMedia("(prefers-reduced-motion: reduce)") : null;
    }
    return query?.matches ?? false;
  }

  const globalNavigator = global$1.navigator ?? { userAgent: "" };
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
      this.defaults = { ...defaults };
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
      return extend(out, ...args);
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
          const styles = global$1.getComputedStyle(el);
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
  const jarallax = function jarallax2(items, options, ...args) {
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
  jarallax.constructor = Jarallax;

  const $ = global$1.jQuery;
  if (typeof $ !== "undefined") {
    const plugin = function plugin2(...args) {
      Array.prototype.unshift.call(args, this);
      const result = jarallax.apply(global$1, args);
      return typeof result !== "object" ? result : this;
    };
    plugin.constructor = jarallax.constructor;
    const oldPlugin = $.fn.jarallax;
    $.fn.jarallax = plugin;
    plugin.noConflict = function noConflict() {
      $.fn.jarallax = oldPlugin;
      return this;
    };
  }
  ready(() => {
    jarallax(document.querySelectorAll("[data-jarallax]"));
  });

  return jarallax;

}));
//# sourceMappingURL=jarallax.js.map
