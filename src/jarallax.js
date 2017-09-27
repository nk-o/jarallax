// test if css property supported by browser
// like "transform"
const tempDiv = document.createElement('div');
function isPropertySupported(property) {
    const prefixes = ['O', 'Moz', 'ms', 'Ms', 'Webkit'];
    let i = prefixes.length;
    if (tempDiv.style[property] !== undefined) {
        return true;
    }
    property = property.charAt(0).toUpperCase() + property.substr(1);
    // eslint-disable-next-line no-empty
    while (--i > -1 && tempDiv.style[prefixes[i] + property] === undefined) {}
    return i >= 0;
}

const supportTransform = isPropertySupported('transform');
const supportTransform3D = isPropertySupported('perspective');

const ua = navigator.userAgent;
const isAndroid = ua.toLowerCase().indexOf('android') > -1;
const isIOs = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
const isFirefox = ua.toLowerCase().indexOf('firefox') > -1;
const isIE = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1 || ua.indexOf('Edge/') > -1;
const isIElt10 = document.all && !window.atob;

// requestAnimationFrame polyfill
const rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
        setTimeout(callback, 1000 / 60);
    };

// init events
function addEventListener(el, eventName, handler) {
    if (el.addEventListener) {
        el.addEventListener(eventName, handler);
    } else {
        el.attachEvent(`on${eventName}`, () => {
            handler.call(el);
        });
    }
}

// Window data
let wndW;
let wndH;
function updateWndVars() {
    wndW = window.innerWidth || document.documentElement.clientWidth;
    wndH = window.innerHeight || document.documentElement.clientHeight;
}
updateWndVars();
addEventListener(window, 'resize', updateWndVars);
addEventListener(window, 'orientationchange', updateWndVars);
addEventListener(window, 'load', updateWndVars);

// list with all jarallax instances
// need to render all in one scroll/resize event
const jarallaxList = [];

// Animate if changed window size or scrolled page
let oldPageData = false;
function updateParallax() {
    if (!jarallaxList.length) {
        return;
    }

    let wndY;
    if (window.pageYOffset !== undefined) {
        wndY = window.pageYOffset;
    } else {
        wndY = (document.documentElement || document.body.parentNode || document.body).scrollTop;
    }

    const isResized = !oldPageData || oldPageData.width !== wndW || oldPageData.height !== wndH;
    const isScrolled = !oldPageData || oldPageData.y !== wndY;

    if (isResized || isScrolled) {
        jarallaxList.forEach((item) => {
            if (isResized) {
                item.onResize();
            }
            if (isScrolled) {
                item.onScroll();
            }
        });
    }

    oldPageData = {
        width: wndW,
        height: wndH,
        y: wndY,
    };

    rAF(updateParallax);
}


let instanceID = 0;

// Jarallax class
class Jarallax {
    constructor(item, userOptions) {
        const _this = this;

        _this.instanceID = instanceID++;

        _this.$item = item;

        _this.defaults = {
            type: 'scroll', // type of parallax: scroll, scale, opacity, scale-opacity, scroll-opacity
            speed: 0.5, // supported value from -1 to 2
            imgSrc: null,
            imgElement: '.jarallax-img',
            imgSize: 'cover',
            imgPosition: '50% 50%',
            imgRepeat: 'no-repeat', // supported only for background, not for <img> tag
            elementInViewport: null,
            zIndex: -100,
            noAndroid: false,
            noIos: false,

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
        const deprecatedDataAttribute = _this.$item.getAttribute('data-jarallax');
        const oldDataOptions = JSON.parse(deprecatedDataAttribute || '{}');
        if (deprecatedDataAttribute) {
            console.warn('Detected usage of deprecated data-jarallax JSON options, you should use pure data-attribute options. See info here - https://github.com/nk-o/jarallax/issues/53');
        }

        // prepare data-options
        const dataOptions = _this.$item.dataset;
        const pureDataOptions = {};
        Object.keys(dataOptions).forEach((key) => {
            const loweCaseOption = key.substr(0, 1).toLowerCase() + key.substr(1);
            if (loweCaseOption && typeof _this.defaults[loweCaseOption] !== 'undefined') {
                pureDataOptions[loweCaseOption] = dataOptions[key];
            }
        });

        _this.options = _this.extend({}, _this.defaults, oldDataOptions, pureDataOptions, userOptions);

        // prepare 'true' and 'false' strings to boolean
        Object.keys(_this.options).forEach((key) => {
            if (_this.options[key] === 'true') {
                _this.options[key] = true;
            } else if (_this.options[key] === 'false') {
                _this.options[key] = false;
            }
        });

        // fix speed option [-1.0, 2.0]
        _this.options.speed = Math.min(2, Math.max(-1, parseFloat(_this.options.speed)));

        // custom element to check if parallax in viewport
        let elementInVP = _this.options.elementInViewport;
        // get first item from array
        if (elementInVP && typeof elementInVP === 'object' && typeof elementInVP.length !== 'undefined') {
            elementInVP = elementInVP[0];
        }
        // check if dom element
        if (!(elementInVP instanceof Element)) {
            elementInVP = null;
        }
        _this.options.elementInViewport = elementInVP;

        _this.image = {
            src: _this.options.imgSrc || null,
            $container: null,
            // fix for some devices
            // use <img> instead of background image - more smoothly
            useImgTag: isIOs || isAndroid || isIE,

            // position absolute is needed on IE9 and FireFox because fixed position have glitches
            position: !supportTransform3D || isFirefox ? 'absolute' : 'fixed',
        };

        if (_this.initImg() && _this.canInitParallax()) {
            _this.init();
        }
    }

    // add styles to element
    css(el, styles) {
        if (typeof styles === 'string') {
            if (window.getComputedStyle) {
                return window.getComputedStyle(el).getPropertyValue(styles);
            }
            return el.style[styles];
        }

        // add transform property with vendor prefixes
        if (styles.transform) {
            if (supportTransform3D) {
                styles.transform += ' translateZ(0)';
            }
            styles.WebkitTransform = styles.transform;
            styles.MozTransform = styles.transform;
            styles.msTransform = styles.transform;
            styles.OTransform = styles.transform;
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

    // Jarallax functions
    initImg() {
        const _this = this;

        // find image element
        let $imgElement = _this.options.imgElement;
        if ($imgElement && typeof $imgElement === 'string') {
            $imgElement = _this.$item.querySelector($imgElement);
        }
        // check if dom element
        if (!($imgElement instanceof Element)) {
            $imgElement = null;
        }

        if ($imgElement) {
            _this.image.$item = $imgElement;
            _this.image.$itemParent = _this.image.$item.parentNode;
            _this.image.useImgTag = true;
            _this.image.useCustomImgTag = true;
        }

        // true if there is img tag
        if (_this.image.$item) {
            return true;
        }

        // get image src
        if (_this.image.src === null) {
            _this.image.src = _this.css(_this.$item, 'background-image').replace(/^url\(['"]?/g, '').replace(/['"]?\)$/g, '');
        }
        return !(!_this.image.src || _this.image.src === 'none');
    }

    canInitParallax() {
        return supportTransform &&
               !(isAndroid && this.options.noAndroid) &&
               !(isIOs && this.options.noIos);
    }

    init() {
        const _this = this;
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

        // save default user styles
        const curStyle = _this.$item.getAttribute('style');
        if (curStyle) {
            _this.$item.setAttribute('data-jarallax-original-styles', curStyle);
        }
        if (_this.image.$item && _this.image.useCustomImgTag) {
            const curImgStyle = _this.image.$item.getAttribute('style');
            if (curImgStyle) {
                _this.image.$item.setAttribute('data-jarallax-original-styles', curImgStyle);
            }
        }

        // set relative position and z-index to the parent
        if (_this.css(_this.$item, 'position') === 'static') {
            _this.css(_this.$item, {
                position: 'relative',
            });
        }
        if (_this.css(_this.$item, 'z-index') === 'auto') {
            _this.css(_this.$item, {
                zIndex: 0,
            });
        }

        // container for parallax image
        _this.image.$container = document.createElement('div');
        _this.css(_this.image.$container, containerStyles);
        _this.css(_this.image.$container, {
            'z-index': _this.options.zIndex,
        });
        _this.image.$container.setAttribute('id', `jarallax-container-${_this.instanceID}`);
        _this.$item.appendChild(_this.image.$container);

        // use img tag
        if (_this.image.useImgTag) {
            if (!_this.image.$item) {
                _this.image.$item = document.createElement('img');
                _this.image.$item.setAttribute('src', _this.image.src);
            }

            imageStyles = _this.extend({
                'object-fit': _this.options.imgSize,
                // support for plugin https://github.com/bfred-it/object-fit-images
                'font-family': `object-fit: ${_this.options.imgSize}; object-position: ${_this.options.imgPosition};`,
                'max-width': 'none',
            }, containerStyles, imageStyles);

        // use div with background image
        } else {
            _this.image.$item = document.createElement('div');
            imageStyles = _this.extend({
                'background-position': _this.options.imgPosition,
                'background-size': _this.options.imgSize,
                'background-repeat': _this.options.imgRepeat,
                'background-image': `url("${_this.image.src}")`,
            }, containerStyles, imageStyles);
        }

        // check if one of parents have transform style (without this check, scroll transform will be inverted)
        // discussion - https://github.com/nk-o/jarallax/issues/9
        let parentWithTransform = 0;
        let $itemParents = _this.$item;
        while ($itemParents !== null && $itemParents !== document && parentWithTransform === 0) {
            const parentTransform = _this.css($itemParents, '-webkit-transform') || _this.css($itemParents, '-moz-transform') || _this.css($itemParents, 'transform');
            if (parentTransform && parentTransform !== 'none') {
                parentWithTransform = 1;

                // add transform on parallax container if there is parent with transform
                _this.css(_this.image.$container, {
                    transform: 'translateX(0) translateY(0)',
                });
            }
            $itemParents = $itemParents.parentNode;
        }

        // absolute position if one of parents have transformations or parallax without scroll
        if (parentWithTransform || _this.options.type === 'opacity' || _this.options.type === 'scale' || _this.options.type === 'scale-opacity' || _this.options.speed === 1) {
            _this.image.position = 'absolute';
        }

        // add position to parallax block
        imageStyles.position = _this.image.position;

        // insert parallax image
        _this.css(_this.image.$item, imageStyles);
        _this.image.$container.appendChild(_this.image.$item);

        // set initial position and size
        _this.coverImage();
        _this.clipContainer();
        _this.onScroll(true);

        // call onInit event
        if (_this.options.onInit) {
            _this.options.onInit.call(_this);
        }

        // remove default user background
        if (_this.css(_this.$item, 'background-image') !== 'none') {
            _this.css(_this.$item, {
                'background-image': 'none',
            });
        }

        jarallaxList.push(_this);

        if (jarallaxList.length === 1) {
            updateParallax();
        }
    }

    destroy() {
        const _this = this;

        // remove from instances list
        jarallaxList.forEach((item, key) => {
            if (item.instanceID === _this.instanceID) {
                jarallaxList.splice(key, 1);
            }
        });

        // return styles on container as before jarallax init
        const originalStylesTag = _this.$item.getAttribute('data-jarallax-original-styles');
        _this.$item.removeAttribute('data-jarallax-original-styles');
        // null occurs if there is no style tag before jarallax init
        if (!originalStylesTag) {
            _this.$item.removeAttribute('style');
        } else {
            _this.$item.setAttribute('style', originalStylesTag);
        }

        if (_this.image.$item && _this.image.useCustomImgTag) {
            // return styles on img tag as before jarallax init
            const originalStylesImgTag = _this.image.$item.getAttribute('data-jarallax-original-styles');
            _this.image.$item.removeAttribute('data-jarallax-original-styles');
            // null occurs if there is no style tag before jarallax init
            if (!originalStylesImgTag) {
                _this.image.$item.removeAttribute('style');
            } else {
                _this.image.$item.setAttribute('style', originalStylesTag);
            }

            // move img tag to its default position
            if (_this.image.$itemParent) {
                _this.image.$itemParent.appendChild(_this.image.$item);
            }
        }

        // remove additional dom elements
        if (_this.$clipStyles) {
            _this.$clipStyles.parentNode.removeChild(_this.$clipStyles);
        }
        if (_this.image.$container) {
            _this.image.$container.parentNode.removeChild(_this.image.$container);
        }

        // call onDestroy event
        if (_this.options.onDestroy) {
            _this.options.onDestroy.call(_this);
        }

        // delete jarallax from item
        delete _this.$item.jarallax;
    }

    // it will remove some image overlapping
    // overlapping occur due to an image position fixed inside absolute position element (webkit based browsers works without any fix)
    clipContainer() {
        // clip is not working properly on real IE9 and less
        if (isIElt10) {
            return;
        }

        const _this = this;
        const rect = _this.image.$container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        if (!_this.$clipStyles) {
            _this.$clipStyles = document.createElement('style');
            _this.$clipStyles.setAttribute('type', 'text/css');
            _this.$clipStyles.setAttribute('id', `jarallax-clip-${_this.instanceID}`);
            const head = document.head || document.getElementsByTagName('head')[0];
            head.appendChild(_this.$clipStyles);
        }

        const styles = [
            `#jarallax-container-${_this.instanceID} {`,
            `   clip: rect(0 ${width}px ${height}px 0);`,
            `   clip: rect(0, ${width}px, ${height}px, 0);`,
            '}',
        ].join('\n');

        // add clip styles inline (this method need for support IE8 and less browsers)
        if (_this.$clipStyles.styleSheet) {
            _this.$clipStyles.styleSheet.cssText = styles;
        } else {
            _this.$clipStyles.innerHTML = styles;
        }
    }

    coverImage() {
        const _this = this;

        const rect = _this.image.$container.getBoundingClientRect();
        const contH = rect.height;
        const speed = _this.options.speed;
        const isScroll = _this.options.type === 'scroll' || _this.options.type === 'scroll-opacity';
        let scrollDist = 0;
        let resultH = contH;
        let resultMT = 0;

        // scroll parallax
        if (isScroll) {
            // scroll distance and height for image
            if (speed < 0) {
                scrollDist = speed * Math.max(contH, wndH);
            } else {
                scrollDist = speed * (contH + wndH);
            }

            // size for scroll parallax
            if (speed > 1) {
                resultH = Math.abs(scrollDist - wndH);
            } else if (speed < 0) {
                resultH = scrollDist / speed + Math.abs(scrollDist);
            } else {
                resultH += Math.abs(wndH - contH) * (1 - speed);
            }

            scrollDist /= 2;
        }

        // store scroll distance
        _this.parallaxScrollDistance = scrollDist;

        // vertical center
        if (isScroll) {
            resultMT = (wndH - resultH) / 2;
        } else {
            resultMT = (contH - resultH) / 2;
        }

        // apply result to item
        _this.css(_this.image.$item, {
            height: `${resultH}px`,
            marginTop: `${resultMT}px`,
            left: _this.image.position === 'fixed' ? (`${rect.left}px`) : '0',
            width: `${rect.width}px`,
        });

        // call onCoverImage event
        if (_this.options.onCoverImage) {
            _this.options.onCoverImage.call(_this);
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
        const _this = this;

        const rect = _this.$item.getBoundingClientRect();
        const contT = rect.top;
        const contH = rect.height;
        const styles = {};

        // check if in viewport
        let viewportRect = rect;
        if (_this.options.elementInViewport) {
            viewportRect = _this.options.elementInViewport.getBoundingClientRect();
        }
        _this.isElementInViewport =
            viewportRect.bottom >= 0 &&
            viewportRect.right >= 0 &&
            viewportRect.top <= wndH &&
            viewportRect.left <= wndW;

        // stop calculations if item is not in viewport
        if (force ? false : !_this.isElementInViewport) {
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
        if (_this.options.type === 'opacity' || _this.options.type === 'scale-opacity' || _this.options.type === 'scroll-opacity') {
            styles.transform = ''; // empty to add translateZ(0) where it is possible
            styles.opacity = visiblePercent;
        }

        // scale
        if (_this.options.type === 'scale' || _this.options.type === 'scale-opacity') {
            let scale = 1;
            if (_this.options.speed < 0) {
                scale -= _this.options.speed * visiblePercent;
            } else {
                scale += _this.options.speed * (1 - visiblePercent);
            }
            styles.transform = `scale(${scale})`;
        }

        // scroll
        if (_this.options.type === 'scroll' || _this.options.type === 'scroll-opacity') {
            let positionY = _this.parallaxScrollDistance * fromViewportCenter;

            // fix if parallax block in absolute position
            if (_this.image.position === 'absolute') {
                positionY -= contT;
            }

            styles.transform = `translateY(${positionY}px)`;
        }

        _this.css(_this.image.$item, styles);

        // call onScroll event
        if (_this.options.onScroll) {
            _this.options.onScroll.call(_this, {
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

// no conflict
const oldPlugin = window.jarallax;
window.jarallax = plugin;
window.jarallax.noConflict = function () {
    window.jarallax = oldPlugin;
    return this;
};

// jQuery support
if (typeof jQuery !== 'undefined') {
    const jQueryPlugin = function () {
        const args = arguments || [];
        Array.prototype.unshift.call(args, this);
        const res = plugin.apply(window, args);
        return typeof res !== 'object' ? res : this;
    };
    jQueryPlugin.constructor = Jarallax;

    // no conflict
    const oldJqPlugin = jQuery.fn.jarallax;
    jQuery.fn.jarallax = jQueryPlugin;
    jQuery.fn.jarallax.noConflict = function () {
        jQuery.fn.jarallax = oldJqPlugin;
        return this;
    };
}

// data-jarallax initialization
addEventListener(window, 'DOMContentLoaded', () => {
    plugin(document.querySelectorAll('[data-jarallax], [data-jarallax-video]'));
});
