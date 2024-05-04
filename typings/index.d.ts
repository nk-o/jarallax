// Type definitions for jarallax 1.9.3
// Project: https://github.com/nk-o/jarallax
// Definitions by: Dave Macaulay <https://github.com/davemacaulay>
// TypeScript Version: 2.3

/// <reference types="jquery"/>

/**
 * Scroll calculations used by onScroll event
 */
export interface JarallaxOnScrollCalculations {
  rect: object;
  beforeTop: number;
  beforeTopEnd: number;
  afterTop: number;
  beforeBottom: number;
  beforeBottomEnd: number;
  afterBottom: number;
  visiblePercent: number;
  fromViewportCenter: number;
}

/**
 * Configurable options for Jarallax
 */
export interface JarallaxOptions {
  /**
   * scroll, scale, opacity, scroll-opacity, scale-opacity.
   */
  type?: string;

  /**
   * Parallax effect speed. Provide numbers from -1.0 to 2.0.
   */
  speed?: number;

  /**
   * Container class attribute.
   */
  containerClass?: string;

  /**
   * Image url. By default used image from background.
   */
  imgSrc?: string;

  /**
   * Image tag that will be used as background.
   */
  imgElement?: string | Element;

  /**
   * Image size. If you use <img> tag for background, you should add object-fit values, else use background-size
   * values.
   */
  imgSize?: string;

  /**
   * Image position. If you use <img> tag for background, you should add object-position values, else use
   * background-position values.
   */
  imgPosition?: string;

  /**
   * Image repeat. Supported only background-position values.
   */
  imgRepeat?: 'repeat' | 'no-repeat';

  /**
   * Keep <img> tag in it's default place after Jarallax inited.
   */
  keepImg?: boolean;

  /**
   * Use custom DOM / jQuery element to check if parallax block in viewport.
   * More info here - https://github.com/nk-o/jarallax/issues/13.
   */
  elementInViewport?: Element | JQuery<Element>;

  /**
   * z-index of parallax container.
   */
  zIndex?: number;

  /**
   * Disable parallax on specific user agents (using regular expression) or with function return value.
   * The image will be set on the background.
   */
  disableParallax?: boolean | RegExp | function;

  /**
   * Called when parallax working. Use first argument with calculations.
   * More info https://github.com/nk-o/jarallax#onscroll-event.
   *
   * @param {JarallaxOnScrollCalculations} calculations
   */
  onScroll?: (calculations: JarallaxOnScrollCalculations) => void;

  /**
   * Called after init end.
   */
  onInit?: () => void;

  /**
   * Called after destroy.
   */
  onDestroy?: () => void;

  /**
   * Called after cover image.
   */
  onCoverImage?: () => void;

  // --- Video Extension ---

  /**
   * Video element class attribute.
   */
  videoClass?: string;

  /**
   * You can use Youtube, Vimeo or local videos. Also you can use data attribute data-jarallax-video.
   */
  videoSrc?: string;

  /**
   * Start time in seconds when video will be started (this value will be applied also after loop).
   */
  videoStartTime?: number;

  /**
   * End time in seconds when video will be ended.
   */
  videoEndTime?: number;

  /**
   * Video volume from 0 to 100.
   */
  videoVolume?: number;

  /**
   * Loop video to play infinitely.
   */
  videoLoop?: boolean;

  /**
   * Play video only when it is visible on the screen.
   */
  videoPlayOnlyVisible?: boolean;

  /**
   * Preload videos only when it is visible on the screen.
   */
  videoLazyLoading?: boolean;

  /**
   * Disable video load on specific user agents (using regular expression) or with function return value.
   * The image will be set on the background.
   */
  disableVideo?: boolean | RegExp | function;

  /**
   * Called right after video is inserted in the parallax block. Video can be accessed by `this.$video`
   */
  onVideoInsert?: () => void;

  /**
   * Called after VideoWorker script initialized. Available parameter with videoWorkerObject.
   */
  onVideoWorkerInit?: () => void;
}

/**
 * Main invocation of Jarallax
 *
 * @param {Element | Element[] | NodeListOf<Element> | JQuery<Element>} elements
 * @param {JarallaxOptions} userOptions
 */
export function jarallax(
  elements: Element | Element[] | NodeListOf<Element> | JQuery<Element>,
  userOptions: JarallaxOptions
): void;

/**
 * Invocation of jarallaxVideo
 *
 * @param {typeof jarallax} jarallaxInstance
 */
export function jarallaxVideo(jarallaxInstance?: typeof jarallax): void;

/**
 * Void callable methods
 *
 * @param {Element | Element[] | NodeListOf<Element> | JQuery<Element>} elements
 * @param {"destroy" | "onResize" | "onScroll"} methodName
 */
export function jarallax(
  elements: Element | Element[] | NodeListOf<Element> | JQuery<Element>,
  methodName: 'destroy' | 'onResize' | 'onScroll'
): void;

/**
 * Is visible method
 *
 * @param {Element | Element[] | NodeListOf<Element> | JQuery<Element>} elements
 * @param {"isVisible"} methodName
 * @returns {boolean}
 */
export function jarallax(
  elements: Element | Element[] | NodeListOf<Element> | JQuery<Element>,
  methodName: 'isVisible'
): boolean;

export interface JQuery {
  /**
   * Init Jarallax with options
   *
   * @param {JarallaxOptions} userOptions
   */
  jarallax(userOptions: JarallaxOptions): void;

  /**
   * Run a method on the current instance of Jaralax
   *
   * @param {"destroy" | "onResize" | "onScroll"} methodName
   */
  jarallax(methodName: 'destroy' | 'onResize' | 'onScroll'): void;

  /**
   * Check if an element is visible
   *
   * @param {"isVisible"} methodName
   * @returns {boolean}
   */
  jarallax(methodName: 'isVisible'): boolean;
}
