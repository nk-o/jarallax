import global from './global';
import getWindowSize from './getWindowSize';

// List with all jarallax instances
// need to render all in one scroll/resize event.
const jarallaxList = [];

function updateParallax() {
  if (!jarallaxList.length) {
    return;
  }

  const { width: wndW, height: wndH } = getWindowSize();

  jarallaxList.forEach((data, k) => {
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
      wndH,
    };

    const isResized =
      !oldData ||
      oldData.wndW !== newData.wndW ||
      oldData.wndH !== newData.wndH ||
      oldData.width !== newData.width ||
      oldData.height !== newData.height;
    const isScrolled =
      isResized || !oldData || oldData.top !== newData.top || oldData.bottom !== newData.bottom;

    jarallaxList[k].oldData = newData;

    if (isResized) {
      instance.onResize();
    }
    if (isScrolled) {
      instance.onScroll();
    }
  });

  global.requestAnimationFrame(updateParallax);
}

const visibilityObserver = new global.IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.jarallax.isElementInViewport = entry.isIntersecting;
    });
  },
  {
    // We have to start parallax calculation before the block is in view
    // to prevent possible parallax jumping.
    rootMargin: '50px',
  }
);

export function addObserver(instance) {
  jarallaxList.push({
    instance,
  });

  if (jarallaxList.length === 1) {
    global.requestAnimationFrame(updateParallax);
  }

  visibilityObserver.observe(instance.options.elementInViewport || instance.$item);
}

export function removeObserver(instance) {
  jarallaxList.forEach((data, key) => {
    if (data.instance.instanceID === instance.instanceID) {
      jarallaxList.splice(key, 1);
    }
  });

  visibilityObserver.unobserve(instance.options.elementInViewport || instance.$item);
}
