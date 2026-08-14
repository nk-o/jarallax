import defaults from './defaults';
import global from './utils/global';
import css from './utils/css';
import extend from './utils/extend';
import getParents from './utils/getParents';
import getWindowSize from './utils/getWindowSize';
import { addObserver, removeObserver } from './utils/observer';
import prefersReducedMotion from './utils/prefersReducedMotion';
import type {
  DisableOption,
  JarallaxCoverImageData,
  JarallaxImageData,
  JarallaxItem,
  JarallaxItems,
  JarallaxOptions,
  JarallaxResolvedOptions,
  JarallaxStatic,
  JarallaxWindowData,
} from './types';

const globalNavigator = global.navigator ?? ({ userAgent: '' } as Navigator);
const canUseDOM =
  typeof document !== 'undefined' &&
  typeof Element !== 'undefined' &&
  typeof HTMLElement !== 'undefined';

let instanceID = 0;

// Historical options accept booleans, regexes, strings and callbacks.
// Normalize everything to a callable check so the rest of the runtime only deals with one shape.
function resolveDisableOption(value: DisableOption | undefined): () => boolean {
  if (typeof value === 'string') {
    const regexpMatch = value.match(/^\/(.*)\/([dgimsuvy]*)$/);

    value = regexpMatch ? new RegExp(regexpMatch[1], regexpMatch[2]) : new RegExp(value);
  }

  if (value instanceof RegExp) {
    const regexp = value;

    return () => regexp.test(globalNavigator.userAgent);
  }

  if (typeof value !== 'function') {
    return () => value === true;
  }

  return value;
}

class Jarallax {
  [key: string]: unknown;

  instanceID: number;

  $item: JarallaxItem;

  defaults: JarallaxResolvedOptions;

  options: JarallaxResolvedOptions;

  pureOptions: Record<string, unknown>;

  image: JarallaxImageData;

  parallaxScrollDistance = 0;

  isElementInViewport = false;

  constructor(item: JarallaxItem, userOptions?: JarallaxOptions) {
    this.instanceID = instanceID;
    instanceID += 1;

    this.$item = item;
    this.defaults = { ...defaults } as JarallaxResolvedOptions;

    const dataOptions = this.$item.dataset || {};
    const pureDataOptions: Record<string, unknown> = {};

    // Keep supporting data-* overrides because they are part of the public API.
    Object.keys(dataOptions).forEach((key) => {
      const lowerCaseOption = key.slice(0, 1).toLowerCase() + key.slice(1);

      if (
        lowerCaseOption &&
        typeof this.defaults[lowerCaseOption as keyof JarallaxResolvedOptions] !== 'undefined'
      ) {
        pureDataOptions[lowerCaseOption] = dataOptions[key];
      }
    });

    this.options = this.extend(
      {},
      this.defaults as unknown as Record<string, unknown>,
      pureDataOptions,
      (userOptions || {}) as Record<string, unknown>
    ) as JarallaxResolvedOptions;
    this.pureOptions = this.extend({}, this.options as unknown as Record<string, unknown>);

    // Legacy HTML usage passes booleans as strings through data attributes.
    Object.keys(this.options).forEach((key) => {
      const optionKey = key as keyof JarallaxResolvedOptions;
      const value = this.options[optionKey];

      if (value === 'true') {
        (this.options as unknown as Record<string, unknown>)[key] = true;
      } else if (value === 'false') {
        (this.options as unknown as Record<string, unknown>)[key] = false;
      }
    });

    this.options.speed = Math.min(2, Math.max(-1, parseFloat(`${this.options.speed}`)));

    // Readers who ask for reduced motion get the same treatment as `disableParallax: true`:
    // the image is still covered and positioned, it just never moves with the scroll.
    const disableParallax = resolveDisableOption(
      userOptions?.disableParallax ?? this.options.disableParallax
    );
    this.options.disableParallax = () => prefersReducedMotion() || disableParallax();

    // Reduced motion stops background video too, but what to show instead depends on the
    // provider, so that decision lives in the video extension and this option keeps meaning
    // only what the author asked for.
    this.options.disableVideo = resolveDisableOption(
      userOptions?.disableVideo ?? this.options.disableVideo
    );

    // `elementInViewport` historically accepts a DOM node or a jQuery-like collection.
    let elementInVP = this.options.elementInViewport;

    if (
      elementInVP &&
      typeof elementInVP === 'object' &&
      'length' in elementInVP &&
      !(elementInVP instanceof Element)
    ) {
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
      position: 'fixed',
    };

    if (this.initImg() && this.canInitParallax()) {
      this.init();
    }
  }

  css(el: HTMLElement, styles: string): string;
  css(el: HTMLElement, styles: Record<string, string | number>): HTMLElement;
  css(el: HTMLElement, styles: string | Record<string, string | number>): string | HTMLElement {
    return css(el, styles as never);
  }

  extend<T extends Record<string, unknown>>(
    out: T,
    ...args: Array<Record<string, unknown> | null | undefined>
  ): T {
    return extend(out, ...args);
  }

  getWindowData(): JarallaxWindowData {
    const { width, height } = getWindowSize();

    return {
      width,
      height,
      y: canUseDOM ? document.documentElement.scrollTop : 0,
    };
  }

  initImg(): boolean {
    let imageElement = this.options.imgElement;

    // Support selector-based img lookup for existing markup contracts.
    if (imageElement && typeof imageElement === 'string') {
      imageElement = this.$item.querySelector(imageElement);
    }

    if (!(imageElement instanceof Element)) {
      if (this.options.imgSrc) {
        // When only an imgSrc is provided, create a synthetic image so downstream logic stays unified.
        const image = new Image();
        image.src = this.options.imgSrc;
        imageElement = image;
      } else {
        imageElement = null;
      }
    }

    if (imageElement) {
      if (this.options.keepImg) {
        this.image.$item = imageElement.cloneNode(true) as HTMLElement;
      } else {
        this.image.$item = imageElement as HTMLElement;
        this.image.$itemParent = imageElement.parentNode;
      }
      this.image.useImgTag = true;
    }

    if (this.image.$item) {
      return true;
    }

    if (this.image.src === null) {
      // Background mode uses a transparent pixel as a placeholder and keeps the original CSS background separately.
      this.image.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      this.image.bgImage = this.css(this.$item, 'background-image');
    }

    return Boolean(this.image.bgImage && this.image.bgImage !== 'none');
  }

  canInitParallax(): boolean {
    return !this.options.disableParallax();
  }

  init(): void {
    const containerStyles: Record<string, string | number> = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    };
    let imageStyles: Record<string, string | number> = {
      pointerEvents: 'none',
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
    };

    if (!this.options.keepImg) {
      // Save author styles so destroy() can restore the DOM back to its pre-init state.
      const itemStyle = this.$item.getAttribute('style');

      if (itemStyle) {
        this.$item.setAttribute('data-jarallax-original-styles', itemStyle);
      }

      if (this.image.useImgTag && this.image.$item) {
        const imageStyle = this.image.$item.getAttribute('style');

        if (imageStyle) {
          this.image.$item.setAttribute('data-jarallax-original-styles', imageStyle);
        }
      }
    }

    if (this.css(this.$item, 'position') === 'static') {
      this.css(this.$item, {
        position: 'relative',
      });
    }

    if (this.css(this.$item, 'z-index') === 'auto') {
      this.css(this.$item, {
        zIndex: 0,
      });
    }

    this.image.$container = document.createElement('div');
    this.css(this.image.$container, containerStyles);
    this.css(this.image.$container, {
      zIndex: this.options.zIndex,
    });

    if (this.image.position === 'fixed') {
      // Clip-path avoids visible overflow artifacts for fixed-position images inside absolute containers.
      this.css(this.image.$container, {
        WebkitClipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      });
    }

    this.image.$container.setAttribute('id', `jarallax-container-${this.instanceID}`);

    if (this.options.containerClass) {
      this.image.$container.setAttribute('class', this.options.containerClass);
    }

    this.$item.appendChild(this.image.$container);

    if (this.image.useImgTag && this.image.$item) {
      // Img-tag mode mirrors the old runtime: promote the source img into the parallax container.
      imageStyles = this.extend(
        {
          objectFit: this.options.imgSize,
          objectPosition: this.options.imgPosition,
          maxWidth: 'none',
        },
        containerStyles,
        imageStyles
      );
    } else {
      // Background mode keeps using a generated div so CSS background behavior stays intact.
      this.image.$item = document.createElement('div');

      if (this.image.src) {
        imageStyles = this.extend(
          {
            backgroundPosition: this.options.imgPosition,
            backgroundSize: this.options.imgSize,
            backgroundRepeat: this.options.imgRepeat,
            backgroundImage: this.image.bgImage || `url("${this.image.src}")`,
          },
          containerStyles,
          imageStyles
        );
      }
    }

    if (
      this.options.type === 'opacity' ||
      this.options.type === 'scale' ||
      this.options.type === 'scale-opacity' ||
      this.options.speed === 1
    ) {
      // Non-scroll effects never relied on fixed positioning, so keep them absolute.
      this.image.position = 'absolute';
    }

    // Fixed positioning breaks when an ancestor creates a transformed or scrollable containing block.
    if (this.image.position === 'fixed') {
      const parents = getParents(this.$item).filter((el) => {
        const styles = global.getComputedStyle(el);
        const parentTransform =
          styles.getPropertyValue('-webkit-transform') ||
          styles.getPropertyValue('-moz-transform') ||
          styles.transform;
        const overflowRegex = /(auto|scroll)/;

        return (
          (parentTransform && parentTransform !== 'none') ||
          overflowRegex.test(styles.overflow + styles.overflowY + styles.overflowX)
        );
      });

      this.image.position = parents.length ? 'absolute' : 'fixed';
    }

    imageStyles.position = this.image.position;
    this.css(this.image.$item!, imageStyles);
    this.image.$container.appendChild(this.image.$item!);

    // The first resize/scroll pass establishes geometry before observers start driving updates.
    this.onResize();
    this.onScroll(true);

    this.options.onInit?.call(this);

    if (this.css(this.$item, 'background-image') !== 'none') {
      this.css(this.$item, {
        backgroundImage: 'none',
      });
    }

    addObserver(this);
  }

  destroy(): void {
    removeObserver(this);

    // Restore author styles first so the DOM goes back to its original contract before removing helpers.
    const originalStylesTag = this.$item.getAttribute('data-jarallax-original-styles');
    this.$item.removeAttribute('data-jarallax-original-styles');

    if (!originalStylesTag) {
      this.$item.removeAttribute('style');
    } else {
      this.$item.setAttribute('style', originalStylesTag);
    }

    if (this.image.useImgTag && this.image.$item) {
      // Img mode temporarily moves the source element into the parallax container, so it must be restored too.
      const originalStylesImgTag = this.image.$item.getAttribute('data-jarallax-original-styles');
      this.image.$item.removeAttribute('data-jarallax-original-styles');

      if (!originalStylesImgTag) {
        this.image.$item.removeAttribute('style');
      } else {
        this.image.$item.setAttribute('style', originalStylesImgTag);
      }

      this.image.$itemParent?.appendChild(this.image.$item);
    }

    if (this.image.$container?.parentNode) {
      this.image.$container.parentNode.removeChild(this.image.$container);
    }

    this.options.onDestroy?.call(this);
    delete this.$item.jarallax;
  }

  coverImage(): JarallaxCoverImageData {
    const { height: wndH } = getWindowSize();
    const rect = this.image.$container!.getBoundingClientRect();
    const contH = rect.height;
    const { speed } = this.options;
    const isScroll = this.options.type === 'scroll' || this.options.type === 'scroll-opacity';
    let scrollDist = 0;
    let resultH = contH;

    if (isScroll) {
      // Scroll mode stretches the image so there is enough overscan during viewport movement.
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

    this.css(this.image.$item!, {
      height: `${resultH}px`,
      marginTop: `${resultMT}px`,
      left: this.image.position === 'fixed' ? `${rect.left}px` : '0',
      width: `${rect.width}px`,
    });

    this.options.onCoverImage?.call(this);

    return {
      image: {
        height: resultH,
        marginTop: resultMT,
      },
      container: rect,
    };
  }

  isVisible(): boolean {
    return this.isElementInViewport || false;
  }

  onScroll(force?: boolean): void {
    // Observer-driven updates skip offscreen work unless the first init pass explicitly forces it.
    if (!force && !this.isVisible()) {
      return;
    }

    const { height: wndH } = getWindowSize();
    const rect = this.$item.getBoundingClientRect();
    const contT = rect.top;
    const contH = rect.height;
    const styles: Record<string, string | number> = {};
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

    // Opacity and scale modes share the same visibility calculations but apply different transforms.
    if (
      this.options.type === 'opacity' ||
      this.options.type === 'scale-opacity' ||
      this.options.type === 'scroll-opacity'
    ) {
      styles.transform = 'translate3d(0,0,0)';
      styles.opacity = visiblePercent;
    }

    if (this.options.type === 'scale' || this.options.type === 'scale-opacity') {
      let scale = 1;

      if (this.options.speed < 0) {
        scale -= this.options.speed * visiblePercent;
      } else {
        scale += this.options.speed * (1 - visiblePercent);
      }

      styles.transform = `scale(${scale}) translate3d(0,0,0)`;
    }

    if (this.options.type === 'scroll' || this.options.type === 'scroll-opacity') {
      let positionY = this.parallaxScrollDistance * fromViewportCenter;

      // Absolute-position fallback uses document coordinates, so compensate for the container offset.
      if (this.image.position === 'absolute') {
        positionY -= contT;
      }

      styles.transform = `translate3d(0,${positionY}px,0)`;
    }

    this.css(this.image.$item!, styles);
    this.options.onScroll?.call(this, {
      section: rect,
      beforeTop,
      beforeTopEnd,
      afterTop,
      beforeBottom,
      beforeBottomEnd,
      afterBottom,
      visiblePercent,
      fromViewportCenter,
    });
  }

  onResize(): void {
    this.coverImage();
  }
}

const jarallax: JarallaxStatic = function jarallax(
  items: JarallaxItems,
  options?: JarallaxOptions | string,
  ...args: unknown[]
): JarallaxItems | unknown {
  let normalizedItems: ArrayLike<JarallaxItem> = items as ArrayLike<JarallaxItem>;

  if (!items) {
    return items;
  }

  // Keep the public entrypoint flexible: single node, array-like collections and jQuery sets all work.
  if (
    typeof HTMLElement === 'object'
      ? items instanceof HTMLElement
      : items &&
        typeof items === 'object' &&
        (items as Node).nodeType === 1 &&
        typeof (items as Node).nodeName === 'string'
  ) {
    normalizedItems = [items as JarallaxItem];
  }

  if (
    !normalizedItems ||
    typeof normalizedItems !== 'object' ||
    typeof (normalizedItems as { length?: unknown }).length !== 'number'
  ) {
    return normalizedItems;
  }

  if (!canUseDOM) {
    return typeof options === 'string' ? undefined : normalizedItems;
  }

  let ret: unknown;

  for (let index = 0; index < normalizedItems.length; index += 1) {
    const item = normalizedItems[index];

    if (typeof options === 'object' || typeof options === 'undefined') {
      if (!item.jarallax) {
        item.jarallax = new Jarallax(item, options);
      }
    } else if (item.jarallax) {
      ret = (item.jarallax[options] as (...methodArgs: unknown[]) => unknown).apply(
        item.jarallax,
        args
      );
    }

    if (typeof ret !== 'undefined') {
      return ret;
    }
  }

  return normalizedItems;
} as JarallaxStatic;

jarallax.constructor = Jarallax;

export default jarallax;
