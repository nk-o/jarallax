import domReady from 'lite-ready';
import raf from 'rafl';
import { window } from 'global';

const isIE = navigator.userAgent.indexOf('MSIE ') > -1 || navigator.userAgent.indexOf('Trident/') > -1 || navigator.userAgent.indexOf('Edge/') > -1;

const supportTransform = (() => {
    const prefixes = 'transform WebkitTransform MozTransform'.split(' ');
    const div = document.createElement('div');
    for (let i = 0; i < prefixes.length; i++) {
        if (div && div.style[prefixes[i]] !== undefined) {
            return prefixes[i];
        }
    }
    return false;
})();

// Window data
let wndW;
let wndH;
let wndY;
let forceResizeParallax = false;
let forceScrollParallax = false;
function updateWndVars(e) {
    wndW = window.innerWidth || document.documentElement.clientWidth;
    wndH = window.innerHeight || document.documentElement.clientHeight;
    if (typeof e === 'object' && (e.type === 'load' || e.type === 'dom-loaded')) {
        forceResizeParallax = true;
    }
}
updateWndVars();
window.addEventListener('resize', updateWndVars);
window.addEventListener('orientationchange', updateWndVars);
window.addEventListener('load', updateWndVars);
domReady(() => {
    updateWndVars({
        type: 'dom-loaded',
    });
});

// list with all jarallax instances
// need to render all in one scroll/resize event
const jarallaxList = [];

// Animate if changed window size or scrolled page
let oldPageData = false;
function updateParallax() {
    if (!jarallaxList.length) {
        return;
    }

    if (window.pageYOffset !== undefined) {
        wndY = window.pageYOffset;
    } else {
        wndY = (document.documentElement || document.body.parentNode || document.body).scrollTop;
    }

    const isResized = forceResizeParallax || !oldPageData || oldPageData.width !== wndW || oldPageData.height !== wndH;
    const isScrolled = forceScrollParallax || isResized || !oldPageData || oldPageData.y !== wndY;

    forceResizeParallax = false;
    forceScrollParallax = false;

    if (isResized || isScrolled) {
        jarallaxList.forEach((item) => {
            if (isResized) {
                item.onResize();
            }
            if (isScrolled) {
                item.onScroll();
            }
        });

        oldPageData = {
            width: wndW,
            height: wndH,
            y: wndY,
        };
    }

    raf(updateParallax);
}


// ResizeObserver
const resizeObserver = global.ResizeObserver ? new global.ResizeObserver((entry) => {
    if (entry && entry.length) {
        raf(() => {
            entry.forEach((item) => {
                if (item.target && item.target.jarallax) {
                    if (!forceResizeParallax) {
                        item.target.jarallax.onResize();
                    }
                    forceScrollParallax = true;
                }
            });
        });
    }
}) : false;


let instanceID = 0;

// Jarallax class
class Jarallax {
    constructor(item, userOptions) {
        const self = this;

        self.instanceID = instanceID++;

        self.$item = item;

        self.defaults = {
            type: 'scroll', // type of parallax: scroll, scale, opacity, scale-opacity, scroll-opacity
            speed: 0.5, // supported value from -1 to 2
            imgSrc: null,
            imgElement: '.jarallax-img',
            imgSize: 'cover',
            imgPosition: '50% 50%',
            imgRepeat: 'no-repeat', // supported only for background, not for <img> tag
            keepImg: false, // keep <img> tag in it's default place
            elementInViewport: null,
            zIndex: -100,
            disableParallax: false,
            disableVideo: false,
            automaticResize: true, // use ResizeObserver to recalculate position and size of parallax image

            // video
            videoSrc: null,
            videoStartTime: 0,
            videoEndTime: 0,
            videoVolume: 0,
            videoPlayOnlyVisible: true,

            // events
            onScroll: null, // function(calculations) {}
            onInit: null, // function() {}
            onDestroy: null, // function() {}
            onCoverImage: null, // function() {}
        };

        // DEPRECATED: old data-options
        const deprecatedDataAttribute = self.$item.getAttribute('data-jarallax');
        const oldDataOptions = JSON.parse(deprecatedDataAttribute || '{}');
        if (deprecatedDataAttribute) {
            // eslint-disable-next-line no-console
            console.warn('Detected usage of deprecated data-jarallax JSON options, you should use pure data-attribute options. See info here - https://github.com/nk-o/jarallax/issues/53');
        }

        // prepare data-options
        const dataOptions = self.$item.dataset || {};
        const pureDataOptions = {};
        Object.keys(dataOptions).forEach((key) => {
            const loweCaseOption = key.substr(0, 1).toLowerCase() + key.substr(1);
            if (loweCaseOption && typeof self.defaults[loweCaseOption] !== 'undefined') {
                pureDataOptions[loweCaseOption] = dataOptions[key];
            }
        });

        self.options = self.extend({}, self.defaults, oldDataOptions, pureDataOptions, userOptions);
        self.pureOptions = self.extend({}, self.options);

        // prepare 'true' and 'false' strings to boolean
        Object.keys(self.options).forEach((key) => {
            if (self.options[key] === 'true') {
                self.options[key] = true;
            } else if (self.options[key] === 'false') {
                self.options[key] = false;
            }
        });

        // fix speed option [-1.0, 2.0]
        self.options.speed = Math.min(2, Math.max(-1, parseFloat(self.options.speed)));

        // deprecated noAndroid and noIos options
        if (self.options.noAndroid || self.options.noIos) {
            // eslint-disable-next-line no-console
            console.warn('Detected usage of deprecated noAndroid or noIos options, you should use disableParallax option. See info here - https://github.com/nk-o/jarallax/#disable-on-mobile-devices');

            // prepare fallback if disableParallax option is not used
            if (!self.options.disableParallax) {
                if (self.options.noIos && self.options.noAndroid) {
                    self.options.disableParallax = /iPad|iPhone|iPod|Android/;
                } else if (self.options.noIos) {
                    self.options.disableParallax = /iPad|iPhone|iPod/;
                } else if (self.options.noAndroid) {
                    self.options.disableParallax = /Android/;
                }
            }
        }

        // prepare disableParallax callback
        if (typeof self.options.disableParallax === 'string') {
            self.options.disableParallax = new RegExp(self.options.disableParallax);
        }
        if (self.options.disableParallax instanceof RegExp) {
            const disableParallaxRegexp = self.options.disableParallax;
            self.options.disableParallax = () => disableParallaxRegexp.test(navigator.userAgent);
        }
        if (typeof self.options.disableParallax !== 'function') {
            self.options.disableParallax = () => false;
        }

        // prepare disableVideo callback
        if (typeof self.options.disableVideo === 'string') {
            self.options.disableVideo = new RegExp(self.options.disableVideo);
        }
        if (self.options.disableVideo instanceof RegExp) {
            const disableVideoRegexp = self.options.disableVideo;
            self.options.disableVideo = () => disableVideoRegexp.test(navigator.userAgent);
        }
        if (typeof self.options.disableVideo !== 'function') {
            self.options.disableVideo = () => false;
        }

        // custom element to check if parallax in viewport
        let elementInVP = self.options.elementInViewport;
        // get first item from array
        if (elementInVP && typeof elementInVP === 'object' && typeof elementInVP.length !== 'undefined') {
            [elementInVP] = elementInVP;
        }
        // check if dom element
        if (!(elementInVP instanceof Element)) {
            elementInVP = null;
        }
        self.options.elementInViewport = elementInVP;

        self.image = {
            src: self.options.imgSrc || null,
            $container: null,
            useImgTag: false,

            // position fixed is needed for the most of browsers because absolute position have glitches
            // on MacOS with smooth scroll there is a huge lags with absolute position - https://github.com/nk-o/jarallax/issues/75
            // on mobile devices better scrolled with absolute position
            position: /iPad|iPhone|iPod|Android/.test(navigator.userAgent) ? 'absolute' : 'fixed',
        };

        if (self.initImg() && self.canInitParallax()) {
            self.init();
        }
    }

    // add styles to element
    css(el, styles) {
        if (typeof styles === 'string') {
            return window.getComputedStyle(el).getPropertyValue(styles);
        }

        // add transform property with vendor prefix
        if (styles.transform && supportTransform) {
            styles[supportTransform] = styles.transform;
        }

        Object.keys(styles).forEach((key) => {
            el.style[key] = styles[key];
        });
        return el;
    }

    // Extend like jQuery.extend
    extend(out) {
        out = out || {};
        Object.keys(arguments).forEach((i) => {
            if (!arguments[i]) {
                return;
            }
            Object.keys(arguments[i]).forEach((key) => {
                out[key] = arguments[i][key];
            });
        });
        return out;
    }

    // get window size and scroll position. Useful for extensions
    getWindowData() {
        return {
            width: wndW,
            height: wndH,
            y: wndY,
        };
    }

    // Jarallax functions
    initImg() {
        const self = this;

        // find image element
        let $imgElement = self.options.imgElement;
        if ($imgElement && typeof $imgElement === 'string') {
            $imgElement = self.$item.querySelector($imgElement);
        }
        // check if dom element
        if (!($imgElement instanceof Element)) {
            $imgElement = null;
        }

        if ($imgElement) {
            if (self.options.keepImg) {
                self.image.$item = $imgElement.cloneNode(true);
            } else {
                self.image.$item = $imgElement;
                self.image.$itemParent = $imgElement.parentNode;
            }
            self.image.useImgTag = true;
        }

        // true if there is img tag
        if (self.image.$item) {
            return true;
        }

        // get image src
        if (self.image.src === null) {
            self.image.src = self.css(self.$item, 'background-image').replace(/^url\(['"]?/g, '').replace(/['"]?\)$/g, '');
        }
        return !(!self.image.src || self.image.src === 'none');
    }

    canInitParallax() {
        return supportTransform && !this.options.disableParallax();
    }

    init() {
        const self = this;
        const containerStyles = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
        };
        let imageStyles = {};

        if (!self.options.keepImg) {
            // save default user styles
            const curStyle = self.$item.getAttribute('style');
            if (curStyle) {
                self.$item.setAttribute('data-jarallax-original-styles', curStyle);
            }
            if (self.image.useImgTag) {
                const curImgStyle = self.image.$item.getAttribute('style');
                if (curImgStyle) {
                    self.image.$item.setAttribute('data-jarallax-original-styles', curImgStyle);
                }
            }
        }

        // set relative position and z-index to the parent
        if (self.css(self.$item, 'position') === 'static') {
            self.css(self.$item, {
                position: 'relative',
            });
        }
        if (self.css(self.$item, 'z-index') === 'auto') {
            self.css(self.$item, {
                zIndex: 0,
            });
        }

        // container for parallax image
        self.image.$container = document.createElement('div');
        self.css(self.image.$container, containerStyles);
        self.css(self.image.$container, {
            'z-index': self.options.zIndex,
        });

        // fix for IE https://github.com/nk-o/jarallax/issues/110
        if (isIE) {
            self.css(self.image.$container, {
                opacity: 0.9999,
            });
        }

        self.image.$container.setAttribute('id', `jarallax-container-${self.instanceID}`);
        self.$item.appendChild(self.image.$container);

        // use img tag
        if (self.image.useImgTag) {
            imageStyles = self.extend({
                'object-fit': self.options.imgSize,
                'object-position': self.options.imgPosition,
                // support for plugin https://github.com/bfred-it/object-fit-images
                'font-family': `object-fit: ${self.options.imgSize}; object-position: ${self.options.imgPosition};`,
                'max-width': 'none',
            }, containerStyles, imageStyles);

        // use div with background image
        } else {
            self.image.$item = document.createElement('div');
            if (self.image.src) {
                imageStyles = self.extend({
                    'background-position': self.options.imgPosition,
                    'background-size': self.options.imgSize,
                    'background-repeat': self.options.imgRepeat,
                    'background-image': `url("${self.image.src}")`,
                }, containerStyles, imageStyles);
            }
        }

        if (self.options.type === 'opacity' || self.options.type === 'scale' || self.options.type === 'scale-opacity' || self.options.speed === 1) {
            self.image.position = 'absolute';
        }

        // check if one of parents have transform style (without this check, scroll transform will be inverted if used parallax with position fixed)
        // discussion - https://github.com/nk-o/jarallax/issues/9
        if (self.image.position === 'fixed') {
            let parentWithTransform = 0;
            let $itemParents = self.$item;
            while ($itemParents !== null && $itemParents !== document && parentWithTransform === 0) {
                const parentTransform = self.css($itemParents, '-webkit-transform') || self.css($itemParents, '-moz-transform') || self.css($itemParents, 'transform');
                if (parentTransform && parentTransform !== 'none') {
                    parentWithTransform = 1;
                    self.image.position = 'absolute';
                }
                $itemParents = $itemParents.parentNode;
            }
        }

        // add position to parallax block
        imageStyles.position = self.image.position;

        // insert parallax image
        self.css(self.image.$item, imageStyles);
        self.image.$container.appendChild(self.image.$item);

        // set initial position and size
        self.onResize();
        self.onScroll(true);

        // ResizeObserver
        if (self.options.automaticResize && resizeObserver) {
            resizeObserver.observe(self.$item);
        }

        // call onInit event
        if (self.options.onInit) {
            self.options.onInit.call(self);
        }

        // remove default user background
        if (self.css(self.$item, 'background-image') !== 'none') {
            self.css(self.$item, {
                'background-image': 'none',
            });
        }

        self.addToParallaxList();
    }

    // add to parallax instances list
    addToParallaxList() {
        jarallaxList.push(this);

        if (jarallaxList.length === 1) {
            updateParallax();
        }
    }

    // remove from parallax instances list
    removeFromParallaxList() {
        const self = this;

        jarallaxList.forEach((item, key) => {
            if (item.instanceID === self.instanceID) {
                jarallaxList.splice(key, 1);
            }
        });
    }

    destroy() {
        const self = this;

        self.removeFromParallaxList();

        // return styles on container as before jarallax init
        const originalStylesTag = self.$item.getAttribute('data-jarallax-original-styles');
        self.$item.removeAttribute('data-jarallax-original-styles');
        // null occurs if there is no style tag before jarallax init
        if (!originalStylesTag) {
            self.$item.removeAttribute('style');
        } else {
            self.$item.setAttribute('style', originalStylesTag);
        }

        if (self.image.useImgTag) {
            // return styles on img tag as before jarallax init
            const originalStylesImgTag = self.image.$item.getAttribute('data-jarallax-original-styles');
            self.image.$item.removeAttribute('data-jarallax-original-styles');
            // null occurs if there is no style tag before jarallax init
            if (!originalStylesImgTag) {
                self.image.$item.removeAttribute('style');
            } else {
                self.image.$item.setAttribute('style', originalStylesTag);
            }

            // move img tag to its default position
            if (self.image.$itemParent) {
                self.image.$itemParent.appendChild(self.image.$item);
            }
        }

        // remove additional dom elements
        if (self.$clipStyles) {
            self.$clipStyles.parentNode.removeChild(self.$clipStyles);
        }
        if (self.image.$container) {
            self.image.$container.parentNode.removeChild(self.image.$container);
        }

        // call onDestroy event
        if (self.options.onDestroy) {
            self.options.onDestroy.call(self);
        }

        // delete jarallax from item
        delete self.$item.jarallax;
    }

    // it will remove some image overlapping
    // overlapping occur due to an image position fixed inside absolute position element
    clipContainer() {
        // needed only when background in fixed position
        if (this.image.position !== 'fixed') {
            return;
        }

        const self = this;
        const rect = self.image.$container.getBoundingClientRect();
        const { width, height } = rect;

        if (!self.$clipStyles) {
            self.$clipStyles = document.createElement('style');
            self.$clipStyles.setAttribute('type', 'text/css');
            self.$clipStyles.setAttribute('id', `jarallax-clip-${self.instanceID}`);
            const head = document.head || document.getElementsByTagName('head')[0];
            head.appendChild(self.$clipStyles);
        }

        const styles = `#jarallax-container-${self.instanceID} {
           clip: rect(0 ${width}px ${height}px 0);
           clip: rect(0, ${width}px, ${height}px, 0);
        }`;

        // add clip styles inline (this method need for support IE8 and less browsers)
        if (self.$clipStyles.styleSheet) {
            self.$clipStyles.styleSheet.cssText = styles;
        } else {
            self.$clipStyles.innerHTML = styles;
        }
    }

    coverImage() {
        const self = this;

        const rect = self.image.$container.getBoundingClientRect();
        const contH = rect.height;
        const { speed } = self.options;
        const isScroll = self.options.type === 'scroll' || self.options.type === 'scroll-opacity';
        let scrollDist = 0;
        let resultH = contH;
        let resultMT = 0;

        // scroll parallax
        if (isScroll) {
            // scroll distance and height for image
            if (speed < 0) {
                scrollDist = speed * Math.max(contH, wndH);

                if (wndH < contH) {
                    scrollDist -= speed * (contH - wndH);
                }
            } else {
                scrollDist = speed * (contH + wndH);
            }

            // size for scroll parallax
            if (speed > 1) {
                resultH = Math.abs(scrollDist - wndH);
            } else if (speed < 0) {
                resultH = scrollDist / speed + Math.abs(scrollDist);
            } else {
                resultH += (wndH - contH) * (1 - speed);
            }

            scrollDist /= 2;
        }

        // store scroll distance
        self.parallaxScrollDistance = scrollDist;

        // vertical center
        if (isScroll) {
            resultMT = (wndH - resultH) / 2;
        } else {
            resultMT = (contH - resultH) / 2;
        }

        // apply result to item
        self.css(self.image.$item, {
            height: `${resultH}px`,
            marginTop: `${resultMT}px`,
            left: self.image.position === 'fixed' ? `${rect.left}px` : '0',
            width: `${rect.width}px`,
        });

        // call onCoverImage event
        if (self.options.onCoverImage) {
            self.options.onCoverImage.call(self);
        }

        // return some useful data. Used in the video cover function
        return {
            image: {
                height: resultH,
                marginTop: resultMT,
            },
            container: rect,
        };
    }

    isVisible() {
        return this.isElementInViewport || false;
    }

    onScroll(force) {
        const self = this;

        const rect = self.$item.getBoundingClientRect();
        const contT = rect.top;
        const contH = rect.height;
        const styles = {};

        // check if in viewport
        let viewportRect = rect;
        if (self.options.elementInViewport) {
            viewportRect = self.options.elementInViewport.getBoundingClientRect();
        }
        self.isElementInViewport = viewportRect.bottom >= 0
            && viewportRect.right >= 0
            && viewportRect.top <= wndH
            && viewportRect.left <= wndW;

        // stop calculations if item is not in viewport
        if (force ? false : !self.isElementInViewport) {
            return;
        }

        // calculate parallax helping variables
        const beforeTop = Math.max(0, contT);
        const beforeTopEnd = Math.max(0, contH + contT);
        const afterTop = Math.max(0, -contT);
        const beforeBottom = Math.max(0, contT + contH - wndH);
        const beforeBottomEnd = Math.max(0, contH - (contT + contH - wndH));
        const afterBottom = Math.max(0, -contT + wndH - contH);
        const fromViewportCenter = 1 - 2 * (wndH - contT) / (wndH + contH);

        // calculate on how percent of section is visible
        let visiblePercent = 1;
        if (contH < wndH) {
            visiblePercent = 1 - (afterTop || beforeBottom) / contH;
        } else if (beforeTopEnd <= wndH) {
            visiblePercent = beforeTopEnd / wndH;
        } else if (beforeBottomEnd <= wndH) {
            visiblePercent = beforeBottomEnd / wndH;
        }

        // opacity
        if (self.options.type === 'opacity' || self.options.type === 'scale-opacity' || self.options.type === 'scroll-opacity') {
            styles.transform = 'translate3d(0,0,0)';
            styles.opacity = visiblePercent;
        }

        // scale
        if (self.options.type === 'scale' || self.options.type === 'scale-opacity') {
            let scale = 1;
            if (self.options.speed < 0) {
                scale -= self.options.speed * visiblePercent;
            } else {
                scale += self.options.speed * (1 - visiblePercent);
            }
            styles.transform = `scale(${scale}) translate3d(0,0,0)`;
        }

        // scroll
        if (self.options.type === 'scroll' || self.options.type === 'scroll-opacity') {
            let positionY = self.parallaxScrollDistance * fromViewportCenter;

            // fix if parallax block in absolute position
            if (self.image.position === 'absolute') {
                positionY -= contT;
            }

            styles.transform = `translate3d(0,${positionY}px,0)`;
        }

        self.css(self.image.$item, styles);

        // call onScroll event
        if (self.options.onScroll) {
            self.options.onScroll.call(self, {
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
    }

    onResize() {
        this.coverImage();
        this.clipContainer();
    }
}


// global definition
const plugin = function (items) {
    // check for dom element
    // thanks: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    if (typeof HTMLElement === 'object' ? items instanceof HTMLElement : items && typeof items === 'object' && items !== null && items.nodeType === 1 && typeof items.nodeName === 'string') {
        items = [items];
    }

    const options = arguments[1];
    const args = Array.prototype.slice.call(arguments, 2);
    const len = items.length;
    let k = 0;
    let ret;

    for (k; k < len; k++) {
        if (typeof options === 'object' || typeof options === 'undefined') {
            if (!items[k].jarallax) {
                items[k].jarallax = new Jarallax(items[k], options);
            }
        } else if (items[k].jarallax) {
            // eslint-disable-next-line prefer-spread
            ret = items[k].jarallax[options].apply(items[k].jarallax, args);
        }
        if (typeof ret !== 'undefined') {
            return ret;
        }
    }

    return items;
};
plugin.constructor = Jarallax;

export default plugin;
