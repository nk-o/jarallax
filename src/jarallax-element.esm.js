/* eslint no-case-declarations: "off" */
import global from 'global';

export default function jarallaxElement(jarallax = global.jarallax) {
    if (typeof jarallax === 'undefined') {
        return;
    }

    const Jarallax = jarallax.constructor;

    // redefine default methods
    [
        'initImg',
        'canInitParallax',
        'init',
        'destroy',
        'clipContainer',
        'coverImage',
        'isVisible',
        'onScroll',
        'onResize',
    ].forEach((key) => {
        const def = Jarallax.prototype[key];
        Jarallax.prototype[key] = function () {
            const self = this;
            const args = arguments || [];

            if (key === 'initImg' && self.$item.getAttribute('data-jarallax-element') !== null) {
                self.options.type = 'element';
                self.pureOptions.speed = self.$item.getAttribute('data-jarallax-element') || self.pureOptions.speed;
            }
            if (self.options.type !== 'element') {
                return def.apply(self, args);
            }

            self.pureOptions.threshold = self.$item.getAttribute('data-threshold') || '';

            switch (key) {
            case 'init':
                const speedArr = self.pureOptions.speed.split(' ');
                self.options.speed = self.pureOptions.speed || 0;
                self.options.speedY = speedArr[0] ? parseFloat(speedArr[0]) : 0;
                self.options.speedX = speedArr[1] ? parseFloat(speedArr[1]) : 0;

                const thresholdArr = self.pureOptions.threshold.split(' ');
                self.options.thresholdY = thresholdArr[0] ? parseFloat(thresholdArr[0]) : null;
                self.options.thresholdX = thresholdArr[1] ? parseFloat(thresholdArr[1]) : null;

                def.apply(self, args);

                // restore background image if available.
                const originalStylesTag = self.$item.getAttribute('data-jarallax-original-styles');
                if (originalStylesTag) {
                    self.$item.setAttribute('style', originalStylesTag);
                }

                return true;
            case 'onResize':
                const defTransform = self.css(self.$item, 'transform');
                self.css(self.$item, { transform: '' });
                const rect = self.$item.getBoundingClientRect();
                self.itemData = {
                    width: rect.width,
                    height: rect.height,
                    y: rect.top + self.getWindowData().y,
                    x: rect.left,
                };
                self.css(self.$item, { transform: defTransform });
                break;
            case 'onScroll':
                const wnd = self.getWindowData();
                const centerPercent = (wnd.y + wnd.height / 2 - self.itemData.y - self.itemData.height / 2) / (wnd.height / 2);
                const moveY = centerPercent * self.options.speedY;
                const moveX = centerPercent * self.options.speedX;
                let my = moveY;
                let mx = moveX;
                if (self.options.thresholdY !== null && moveY > self.options.thresholdY) my = 0;
                if (self.options.thresholdX !== null && moveX > self.options.thresholdX) mx = 0;
                self.css(self.$item, { transform: `translate3d(${mx}px,${my}px,0)` });
                break;
            case 'initImg':
            case 'isVisible':
            case 'clipContainer':
            case 'coverImage':
                return true;
            // no default
            }
            return def.apply(self, args);
        };
    });
}
