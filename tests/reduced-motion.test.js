import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJarallaxBlock } from './test-helpers.js';

const videoWorkerState = vi.hoisted(() => ({
  instances: [],
}));

vi.mock('video-worker', () => {
  class FakeVideoWorker {
    constructor(source, options) {
      this.source = source;
      this.options = options;
      this.handlers = new Map();
      this.type = source.includes('vimeo.com') ? 'vimeo' : 'youtube';
      this.videoID = 'mru3Q5m4lkY';
      this.videoWidth = 1280;
      this.videoHeight = 720;
      videoWorkerState.instances.push(this);
    }

    isValid() {
      return true;
    }

    on(event, callback) {
      this.handlers.set(event, callback);
    }

    getImageURL(callback) {
      callback('https://img.youtube.com/vi/mru3Q5m4lkY/maxresdefault.jpg');
    }

    getVideo(callback) {
      const hidden = document.createElement('div');
      const iframe = document.createElement('iframe');
      hidden.appendChild(iframe);
      document.body.appendChild(hidden);
      callback(iframe);
    }

    play = vi.fn();

    pause = vi.fn();
  }

  return { default: FakeVideoWorker };
});

// Only `(prefers-reduced-motion: reduce)` is answered; everything else stays false, which is
// what jsdom would report if it implemented matchMedia at all.
function stubReducedMotion(reduce) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      media: query,
      matches: reduce && query === '(prefers-reduced-motion: reduce)',
      addEventListener() {},
      removeEventListener() {},
    }))
  );
}

describe('prefers-reduced-motion', () => {
  beforeEach(() => {
    vi.resetModules();
    videoWorkerState.instances.length = 0;
  });

  it.each([
    [true, false],
    [false, true],
  ])('reduce=%s -> parallax container created: %s', async (reduce, expectContainer) => {
    stubReducedMotion(reduce);

    const { default: jarallax } = await import('../src/core.ts');
    const block = createJarallaxBlock({ mode: 'background' });

    jarallax(block);

    expect(Boolean(block.querySelector('.jarallax-container'))).toBe(expectContainer);
    expect(block.jarallax.options.disableParallax()).toBe(reduce);
  });

  it.each([
    [true, false],
    [false, true],
  ])('reduce=%s -> background video inserted: %s', async (reduce, expectVideo) => {
    stubReducedMotion(reduce);

    const { default: jarallax } = await import('../src/core.ts');
    const { default: jarallaxVideo } = await import('../src/ext-video.ts');
    const block = createJarallaxBlock({ mode: 'img' });

    jarallaxVideo(jarallax);
    jarallax(block, { videoSrc: 'https://youtu.be/mru3Q5m4lkY' });

    block.jarallax.isElementInViewport = true;
    jarallax(block, 'onScroll');

    expect(Boolean(block.querySelector('iframe'))).toBe(expectVideo);
    expect(block.jarallax.options.disableVideo()).toBe(reduce);
  });

  it('keeps the poster visible instead of the player when motion is reduced', async () => {
    stubReducedMotion(true);

    const { default: jarallax } = await import('../src/core.ts');
    const { default: jarallaxVideo } = await import('../src/ext-video.ts');
    const block = createJarallaxBlock({ mode: 'background' });

    jarallaxVideo(jarallax);
    jarallax(block, { videoSrc: 'https://youtu.be/mru3Q5m4lkY' });

    block.jarallax.isElementInViewport = true;
    jarallax(block, 'onScroll');

    // The author's own background survives, and no provider player was ever asked for.
    expect(block.jarallax.image.bgImage).toContain('https://via.placeholder.com/100x50');
    expect(block.querySelector('iframe')).toBeNull();
    expect(videoWorkerState.instances[0].play).not.toHaveBeenCalled();
  });
});
