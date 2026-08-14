import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJarallaxBlock } from './test-helpers.js';

const videoWorkerState = vi.hoisted(() => ({
  instances: [],
}));

vi.mock('video-worker', () => {
  function parseVideoID(source) {
    if (source.startsWith('mp4:')) {
      return {
        mp4: '../demo/video/local-video.mp4',
        webm: '../demo/video/local-video.webm',
        ogg: '../demo/video/local-video.ogv',
      };
    }

    if (source.includes('vimeo.com')) {
      return '235212527';
    }

    return 'mru3Q5m4lkY';
  }

  class FakeVideoWorker {
    constructor(source, options) {
      this.source = source;
      this.options = options;
      this.handlers = new Map();
      this.type = source.startsWith('mp4:')
        ? 'local'
        : source.includes('vimeo.com')
          ? 'vimeo'
          : 'youtube';
      this.videoID = parseVideoID(source);
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

    emit(event) {
      this.handlers.get(event)?.();
    }

    getImageURL(callback) {
      callback('https://via.placeholder.com/1280x720');
    }

    getVideo(callback) {
      const wrapper = document.createElement('div');
      const element = document.createElement(this.type === 'local' ? 'video' : 'iframe');

      wrapper.appendChild(element);
      document.body.appendChild(wrapper);
      callback(element);
      this.emit('ready');
      this.emit('started');
    }

    play = vi.fn();

    pause = vi.fn();
  }

  return {
    default: FakeVideoWorker,
  };
});

describe('jarallax video DOM integration', () => {
  beforeEach(() => {
    vi.resetModules();
    videoWorkerState.instances.length = 0;
  });

  it.each([
    ['https://youtu.be/mru3Q5m4lkY', 'iframe', 'jarallax-video-youtube'],
    ['https://vimeo.com/235212527', 'iframe', 'jarallax-video-vimeo'],
    [
      'mp4:../demo/video/local-video.mp4,webm:../demo/video/local-video.webm,ogv:../demo/video/local-video.ogv',
      'video',
      'jarallax-video-local',
    ],
  ])('inserts a %s node for %s sources', async (videoSrc, tagName, className) => {
    const { default: jarallax } = await import('../src/core.ts');
    const { default: jarallaxVideo } = await import('../src/ext-video.ts');
    const block = createJarallaxBlock({ mode: 'img' });
    const onVideoInsert = vi.fn();
    const onVideoWorkerInit = vi.fn();

    jarallaxVideo(jarallax);
    jarallax(block, {
      videoSrc,
      onVideoInsert,
      onVideoWorkerInit,
    });

    block.jarallax.isElementInViewport = true;
    jarallax(block, 'onScroll');

    const inserted = block.querySelector(tagName);

    expect(inserted).toBeTruthy();
    expect(inserted.className).toContain(className);
    expect(onVideoInsert).toHaveBeenCalledTimes(1);
    expect(onVideoWorkerInit).toHaveBeenCalledTimes(1);

    if (tagName === 'video') {
      expect(inserted.getAttribute('poster')).toContain('https://via.placeholder.com/100x50');
    }
  });

  // https://github.com/nk-o/jarallax/issues/227
  it.each([
    ['0', true],
    ['30', false],
  ])('mutes based on the numeric value of data-video-volume="%s"', async (attr, expectedMute) => {
    const { default: jarallax } = await import('../src/core.ts');
    const { default: jarallaxVideo } = await import('../src/ext-video.ts');
    const block = createJarallaxBlock({ mode: 'img' });
    block.setAttribute('data-video-src', 'https://youtu.be/mru3Q5m4lkY');
    block.setAttribute('data-video-volume', attr);

    jarallaxVideo(jarallax);
    jarallax(block);

    const [worker] = videoWorkerState.instances;

    expect(worker.options.mute).toBe(expectedMute);
    expect(worker.options.volume).toBe(Number(attr));
  });

  it('forwards the player host options and leaves them undefined when unset', async () => {
    const { default: jarallax } = await import('../src/core.ts');
    const { default: jarallaxVideo } = await import('../src/ext-video.ts');
    const block = createJarallaxBlock({ mode: 'img' });
    const other = createJarallaxBlock({ mode: 'img' });

    jarallaxVideo(jarallax);
    jarallax(block, {
      videoSrc: 'https://youtu.be/mru3Q5m4lkY',
      videoYoutubeHost: 'https://www.youtube-nocookie.com',
    });
    jarallax(other, { videoSrc: 'https://youtu.be/mru3Q5m4lkY' });

    const [withHost, withoutHost] = videoWorkerState.instances;

    expect(withHost.options.youtubeHost).toBe('https://www.youtube-nocookie.com');
    expect(withoutHost.options.youtubeHost).toBeUndefined();
    expect(withoutHost.options.vimeoHost).toBeUndefined();
  });
});
