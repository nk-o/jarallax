import global from './global';
import getWindowSize from './getWindowSize';
import type { JarallaxInstance } from '../types';

interface ObserverData {
  instance: JarallaxInstance;
  oldData?: {
    width: number;
    height: number;
    top: number;
    bottom: number;
    wndW: number;
    wndH: number;
  };
}

// All active instances share a single animation-frame loop so scroll/resize work stays centralized.
const jarallaxList: ObserverData[] = [];

function updateParallax(): void {
  if (!jarallaxList.length) {
    return;
  }

  const { width: wndW, height: wndH } = getWindowSize();

  jarallaxList.forEach((data, index) => {
    const { instance, oldData } = data;

    if (!instance.isVisible()) {
      if (oldData) {
        data.oldData = undefined;
        instance.onScroll();
      }
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

    jarallaxList[index].oldData = newData;

    if (isResized) {
      instance.onResize();
    }

    if (isScrolled) {
      instance.onScroll();
    }
  });

  global.requestAnimationFrame(updateParallax);
}

const visibilityObserver =
  global.IntersectionObserver &&
  new global.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement & { jarallax?: JarallaxInstance };

        if (target.jarallax) {
          // Mark viewport visibility ahead of time so init/onScroll can cheaply skip offscreen work.
          target.jarallax.isElementInViewport = entry.isIntersecting;
        }
      });
    },
    {
      // Start work slightly before the block enters the viewport to reduce visible jumps.
      rootMargin: '50px',
    }
  );

export function addObserver(instance: JarallaxInstance): void {
  jarallaxList.push({
    instance,
  });

  if (jarallaxList.length === 1) {
    global.requestAnimationFrame(updateParallax);
  }

  visibilityObserver?.observe(instance.options.elementInViewport || instance.$item);
}

export function removeObserver(instance: JarallaxInstance): void {
  jarallaxList.forEach((data, key) => {
    if (data.instance.instanceID === instance.instanceID) {
      jarallaxList.splice(key, 1);
    }
  });

  visibilityObserver?.unobserve(instance.options.elementInViewport || instance.$item);
}
