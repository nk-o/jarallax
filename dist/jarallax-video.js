/*!
 * Video Extension for Jarallax v3.0.1 (https://github.com/nk-o/jarallax)
 * Copyright 2026 nK <https://nkdev.info>
 * Licensed under MIT (https://github.com/nk-o/jarallax/blob/master/LICENSE)
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.jarallaxVideo = factory());
})(this, (function () { 'use strict';

  /*!
   * Video Worker v3.0.1 (https://github.com/nk-o/video-worker)
   * Copyright 2026 nK <https://nkdev.info>
   * Licensed under MIT (https://github.com/nk-o/video-worker/blob/master/LICENSE)
   */

  const defaults = {
    autoplay: false,
    loop: false,
    mute: false,
    volume: 100,
    showControls: true,
    accessibilityHidden: false,
    // start / end video time in seconds
    startTime: 0,
    endTime: 0
  };

  function extend(out, ...args) {
    const target = out || {};
    Object.keys(args).forEach((index) => {
      const source = args[Number(index)];
      if (!source) {
        return;
      }
      Object.keys(source).forEach((key) => {
        const typedKey = key;
        const value = source[typedKey];
        if (typeof value !== "undefined") {
          target[typedKey] = value;
        }
      });
    });
    return target;
  }

  let ID = 0;
  class VideoWorkerBase {
    constructor(url, options) {
      this.type = "none";
      this.destroyed = false;
      this.url = url;
      this.options_default = { ...defaults };
      this.options = extend({ ...this.options_default }, options);
      this.videoID = this.constructor.parseURL(url);
      if (this.videoID) {
        this.init();
      }
    }
    isValid() {
      return !!this.videoID;
    }
    init() {
      this.ID = ID;
      ID += 1;
      this.playerID = `VideoWorker-${this.ID}`;
    }
    // events
    on(name, callback) {
      this.userEventsList = this.userEventsList || {};
      if (!this.userEventsList[name]) {
        this.userEventsList[name] = [];
      }
      this.userEventsList[name].push(callback);
    }
    off(name, callback) {
      if (!this.userEventsList || !this.userEventsList[name]) {
        return;
      }
      if (!callback) {
        delete this.userEventsList[name];
        return;
      }
      this.userEventsList[name].forEach((value, key) => {
        var _a;
        if (value === callback) {
          const eventList = (_a = this.userEventsList) == null ? void 0 : _a[name];
          if (eventList) {
            eventList[key] = false;
          }
        }
      });
    }
    fire(name, ...args) {
      if (this.userEventsList && typeof this.userEventsList[name] !== "undefined") {
        this.userEventsList[name].forEach((value) => {
          if (value) {
            value.apply(this, args);
          }
        });
      }
    }
    /**
     * Methods used in providers.
     */
    static parseURL(_url) {
      return false;
    }
    play(_start) {
    }
    pause() {
    }
    mute() {
    }
    unmute() {
    }
    setVolume(_volume = false) {
    }
    getVolume(_callback) {
    }
    getMuted(_callback) {
    }
    setCurrentTime(_currentTime = false) {
    }
    getCurrentTime(_callback) {
    }
    getImageURL(_callback) {
    }
    getVideo(_callback) {
    }
    destroy() {
      var _a, _b;
      this.destroyed = true;
      this.userEventsList = void 0;
      if ((_a = this.$video) == null ? void 0 : _a.parentNode) {
        this.$video.parentNode.removeChild(this.$video);
      }
      if ((_b = this.hiddenContainer) == null ? void 0 : _b.parentNode) {
        this.hiddenContainer.parentNode.removeChild(this.hiddenContainer);
      }
      this.player = void 0;
      this.$video = void 0;
      this.hiddenContainer = void 0;
    }
  }

  class VideoWorkerLocal extends VideoWorkerBase {
    constructor() {
      super(...arguments);
      this.type = "local";
    }
    static parseURL(url) {
      const videoFormats = url.split(/,(?=mp4:|webm:|ogv:|ogg:)/);
      const result = {};
      let ready = 0;
      videoFormats.forEach((value) => {
        const match = value.match(/^(mp4|webm|ogv|ogg):(.*)/);
        if ((match == null ? void 0 : match[1]) && match[2]) {
          const key = match[1] === "ogv" ? "ogg" : match[1];
          result[key] = match[2];
          ready = 1;
        }
      });
      return ready ? result : false;
    }
    play(start) {
      if (!this.player) {
        return;
      }
      if (typeof start !== "undefined") {
        this.player.currentTime = start;
      }
      if (this.player.paused) {
        if (this.options.endTime && !this.options.loop) {
          this.getCurrentTime((seconds) => {
            var _a;
            if (seconds < this.options.endTime) {
              void ((_a = this.player) == null ? void 0 : _a.play());
            }
          });
        } else {
          void this.player.play();
        }
      }
    }
    pause() {
      if (!this.player || this.player.paused) {
        return;
      }
      this.player.pause();
    }
    mute() {
      if (!this.player || !this.$video) {
        return;
      }
      this.$video.muted = true;
    }
    unmute() {
      if (!this.player || !this.$video) {
        return;
      }
      this.$video.muted = false;
    }
    setVolume(volume = false) {
      if (!this.player || !this.$video || typeof volume !== "number") {
        return;
      }
      this.$video.volume = volume / 100;
    }
    getVolume(callback) {
      if (!this.player || !this.$video) {
        callback(false);
        return;
      }
      callback(this.$video.volume * 100);
    }
    getMuted(callback) {
      if (!this.player || !this.$video) {
        callback(null);
        return;
      }
      callback(this.$video.muted);
    }
    setCurrentTime(currentTime = false) {
      if (!this.player || !this.$video || typeof currentTime !== "number") {
        return;
      }
      this.$video.currentTime = currentTime;
    }
    getCurrentTime(callback) {
      if (!this.player) {
        return;
      }
      callback(this.player.currentTime);
    }
    getImageURL(callback) {
      if (this.videoImage) {
        callback(this.videoImage);
      }
    }
    getVideo(callback) {
      if (this.destroyed) {
        return;
      }
      if (this.$video) {
        callback(this.$video);
        return;
      }
      let hiddenDiv;
      if (!this.$video) {
        hiddenDiv = document.createElement("div");
        hiddenDiv.style.display = "none";
      }
      function addSourceElement(element, src, type) {
        const source = document.createElement("source");
        source.src = src;
        source.type = type;
        element.appendChild(source);
      }
      if (!this.$video && hiddenDiv) {
        this.$video = document.createElement("video");
        this.player = this.$video;
        this.hiddenContainer = hiddenDiv;
        if (this.options.showControls) {
          this.$video.controls = true;
        }
        if (typeof this.options.volume === "number") {
          this.setVolume(this.options.volume);
        }
        if (this.options.mute) {
          this.mute();
        }
        if (this.options.loop) {
          this.$video.loop = true;
        }
        this.$video.setAttribute("playsinline", "");
        this.$video.setAttribute("webkit-playsinline", "");
        if (this.options.accessibilityHidden) {
          this.$video.setAttribute("tabindex", "-1");
          this.$video.setAttribute("aria-hidden", "true");
        }
        this.$video.setAttribute("id", this.playerID);
        hiddenDiv.appendChild(this.$video);
        document.body.appendChild(hiddenDiv);
        Object.keys(this.videoID).forEach((key) => {
          const sourceValue = this.videoID[key];
          if (sourceValue) {
            addSourceElement(this.$video, sourceValue, `video/${key}`);
          }
        });
        const player = this.player;
        let localStarted = false;
        this.eventHandlers = {
          playing: (event) => {
            if (!localStarted) {
              this.fire("started", event);
            }
            localStarted = true;
          },
          timeupdate: (event) => {
            this.fire("timeupdate", event);
            if (this.options.endTime && this.player && this.player.currentTime >= this.options.endTime) {
              if (this.options.loop) {
                this.play(this.options.startTime);
              } else {
                this.pause();
              }
            }
          },
          play: (event) => {
            this.fire("play", event);
          },
          pause: (event) => {
            this.fire("pause", event);
          },
          ended: (event) => {
            this.fire("ended", event);
          },
          loadedmetadata: (event) => {
            if (!this.player) {
              return;
            }
            this.videoWidth = this.player.videoWidth || 1280;
            this.videoHeight = this.player.videoHeight || 720;
            this.fire("ready", event);
            if (this.options.autoplay) {
              this.play(this.options.startTime);
            }
          },
          volumechange: (event) => {
            this.getVolume((volume) => {
              if (typeof volume === "number") {
                this.options.volume = volume;
              }
            });
            this.fire("volumechange", event);
          },
          error: (event) => {
            this.fire("error", event);
          }
        };
        player.addEventListener("playing", this.eventHandlers.playing);
        player.addEventListener("timeupdate", this.eventHandlers.timeupdate);
        player.addEventListener("play", this.eventHandlers.play);
        player.addEventListener("pause", this.eventHandlers.pause);
        player.addEventListener("ended", this.eventHandlers.ended);
        player.addEventListener("loadedmetadata", this.eventHandlers.loadedmetadata);
        player.addEventListener("volumechange", this.eventHandlers.volumechange);
        player.addEventListener("error", this.eventHandlers.error);
      }
      callback(this.$video);
    }
    destroy() {
      if (this.player && this.eventHandlers) {
        this.player.removeEventListener("playing", this.eventHandlers.playing);
        this.player.removeEventListener("timeupdate", this.eventHandlers.timeupdate);
        this.player.removeEventListener("play", this.eventHandlers.play);
        this.player.removeEventListener("pause", this.eventHandlers.pause);
        this.player.removeEventListener("ended", this.eventHandlers.ended);
        this.player.removeEventListener("loadedmetadata", this.eventHandlers.loadedmetadata);
        this.player.removeEventListener("volumechange", this.eventHandlers.volumechange);
        this.player.removeEventListener("error", this.eventHandlers.error);
      }
      this.eventHandlers = void 0;
      super.destroy();
    }
  }

  class Deferred {
    constructor() {
      this.doneCallbacks = [];
      this.failCallbacks = [];
    }
    execute(list, args) {
      let index = list.length;
      while (index) {
        index -= 1;
        list[index](...args);
      }
    }
    resolve(...args) {
      this.execute(this.doneCallbacks, args);
    }
    reject(...args) {
      this.execute(this.failCallbacks, args);
    }
    done(callback) {
      this.doneCallbacks.push(callback);
    }
    fail(callback) {
      this.failCallbacks.push(callback);
    }
  }

  let win$1;
  if (typeof window !== "undefined") {
    win$1 = window;
  } else if (typeof self !== "undefined") {
    win$1 = self;
  } else {
    win$1 = globalThis;
  }
  var global$2 = win$1;

  let VimeoAPIadded = 0;
  let loadingVimeoPlayer = 0;
  const loadingVimeoDefer = new Deferred();
  const videoGlobal$1 = global$2;
  function loadAPI$1() {
    if (VimeoAPIadded) {
      return;
    }
    VimeoAPIadded = 1;
    if (typeof videoGlobal$1.Vimeo !== "undefined") {
      return;
    }
    const src = "https://player.vimeo.com/api/player.js";
    let tag = document.createElement("script");
    let head = document.getElementsByTagName("head")[0] || null;
    if (!head || !tag) {
      return;
    }
    tag.src = src;
    head.appendChild(tag);
    head = null;
    tag = null;
  }
  function onAPIready$1(callback) {
    if (typeof videoGlobal$1.Vimeo === "undefined" && !loadingVimeoPlayer) {
      loadingVimeoPlayer = 1;
      const vimeoInterval = setInterval(() => {
        if (typeof videoGlobal$1.Vimeo !== "undefined") {
          clearInterval(vimeoInterval);
          loadingVimeoDefer.resolve("done");
          callback();
        }
      }, 20);
    } else if (typeof videoGlobal$1.Vimeo !== "undefined") {
      callback();
    } else {
      loadingVimeoDefer.done(() => {
        callback();
      });
    }
  }
  class VideoWorkerVimeo extends VideoWorkerBase {
    constructor() {
      super(...arguments);
      this.type = "vimeo";
    }
    static parseURL(url) {
      const regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
      const match = url.match(regExp);
      return (match == null ? void 0 : match[3]) ? match[3] : false;
    }
    // Try to extract a hash for private videos from the URL.
    // Thanks to https://github.com/sampotts/plyr
    static parseURLHash(url) {
      const regex = /^.*(vimeo.com\/|video\/)(\d+)(\?.*&*h=|\/)+([\d,a-f]+)/;
      const found = url.match(regex);
      return found && found.length === 5 ? found[4] : null;
    }
    init() {
      super.init();
      loadAPI$1();
    }
    play(start) {
      if (!this.player) {
        return;
      }
      if (typeof start !== "undefined") {
        void this.player.setCurrentTime(start);
      }
      this.player.getPaused().then((paused) => {
        var _a;
        if (paused) {
          if (this.options.endTime && !this.options.loop) {
            this.getCurrentTime((seconds) => {
              var _a2;
              if (seconds < this.options.endTime) {
                void ((_a2 = this.player) == null ? void 0 : _a2.play());
              }
            });
          } else {
            void ((_a = this.player) == null ? void 0 : _a.play());
          }
        }
      });
    }
    pause() {
      if (!this.player) {
        return;
      }
      this.player.getPaused().then((paused) => {
        var _a;
        if (!paused) {
          void ((_a = this.player) == null ? void 0 : _a.pause());
        }
      });
    }
    mute() {
      if (!this.player || !this.player.setVolume) {
        return;
      }
      this.setVolume(0);
    }
    unmute() {
      if (!this.player || !this.player.setVolume) {
        return;
      }
      this.setVolume(this.options.volume || 100);
    }
    setVolume(volume = false) {
      if (!this.player || typeof volume !== "number" || !this.player.setVolume) {
        return;
      }
      void this.player.setVolume(volume / 100);
    }
    getVolume(callback) {
      if (!this.player) {
        callback(false);
        return;
      }
      if (this.player.getVolume) {
        this.player.getVolume().then((volume) => {
          callback(volume * 100);
        });
      }
    }
    getMuted(callback) {
      if (!this.player) {
        callback(null);
        return;
      }
      if (this.player.getVolume) {
        this.player.getVolume().then((volume) => {
          callback(volume === 0);
        });
      }
    }
    setCurrentTime(currentTime = false) {
      if (!this.player || typeof currentTime !== "number" || !this.player.setCurrentTime) {
        return;
      }
      void this.player.setCurrentTime(currentTime);
    }
    getCurrentTime(callback) {
      if (!this.player || !this.player.getCurrentTime) {
        return;
      }
      this.player.getCurrentTime().then((currentTime) => {
        callback(currentTime);
      });
    }
    getImageURL(callback) {
      if (this.destroyed) {
        return;
      }
      if (this.videoImage) {
        callback(this.videoImage);
        return;
      }
      let width = global$2.innerWidth || 1920;
      if (global$2.devicePixelRatio) {
        width *= global$2.devicePixelRatio;
      }
      width = Math.min(width, 1920);
      const request = new XMLHttpRequest();
      this.imageRequest = request;
      request.open("GET", `https://vimeo.com/api/oembed.json?url=${this.url}&width=${width}`, true);
      request.onreadystatechange = () => {
        if (request.readyState !== 4) {
          return;
        }
        if (request.status >= 200 && request.status < 400) {
          const response = JSON.parse(request.responseText);
          if (response.thumbnail_url) {
            this.videoImage = response.thumbnail_url;
            callback(this.videoImage);
          }
        }
        this.imageRequest = void 0;
      };
      request.send();
    }
    getVideo(callback) {
      if (this.destroyed) {
        return;
      }
      if (this.$video) {
        callback(this.$video);
        return;
      }
      onAPIready$1(() => {
        if (this.destroyed) {
          return;
        }
        let hiddenDiv;
        if (!this.$video) {
          hiddenDiv = document.createElement("div");
          hiddenDiv.style.display = "none";
        }
        this.playerOptions = {
          // GDPR Compliance.
          dnt: 1,
          id: String(this.videoID),
          autopause: 0,
          transparent: 0,
          autoplay: this.options.autoplay ? 1 : 0,
          loop: this.options.loop ? 1 : 0,
          muted: this.options.mute || this.options.volume === 0 ? 1 : 0
        };
        const urlHash = this.constructor.parseURLHash(this.url);
        if (urlHash) {
          this.playerOptions.h = urlHash;
        }
        if (!this.options.showControls) {
          this.playerOptions.controls = 0;
        }
        if (!this.options.showControls && this.options.loop && this.options.autoplay) {
          this.playerOptions.background = 1;
        }
        if (!this.$video && hiddenDiv) {
          this.hiddenContainer = hiddenDiv;
          let playerOptionsString = "";
          Object.keys(this.playerOptions).forEach((key) => {
            var _a;
            const optionKey = key;
            const value = (_a = this.playerOptions) == null ? void 0 : _a[optionKey];
            if (typeof value === "undefined") {
              return;
            }
            if (playerOptionsString !== "") {
              playerOptionsString += "&";
            }
            playerOptionsString += `${key}=${encodeURIComponent(String(value))}`;
          });
          this.$video = document.createElement("iframe");
          this.$video.setAttribute("id", this.playerID);
          this.$video.setAttribute(
            "src",
            `https://player.vimeo.com/video/${String(this.videoID)}?${playerOptionsString}`
          );
          this.$video.setAttribute("frameborder", "0");
          this.$video.setAttribute("mozallowfullscreen", "");
          this.$video.setAttribute("allowfullscreen", "");
          this.$video.setAttribute("title", "Vimeo video player");
          if (this.options.accessibilityHidden) {
            this.$video.setAttribute("tabindex", "-1");
            this.$video.setAttribute("aria-hidden", "true");
          }
          hiddenDiv.appendChild(this.$video);
          document.body.appendChild(hiddenDiv);
        }
        this.player = this.player || new videoGlobal$1.Vimeo.Player(
          this.$video,
          this.playerOptions
        );
        if (!this.options.mute && typeof this.options.volume === "number") {
          this.setVolume(this.options.volume);
        }
        if (this.options.startTime && this.options.autoplay) {
          void this.player.setCurrentTime(this.options.startTime);
        }
        this.player.getVideoWidth().then((widthValue) => {
          this.videoWidth = widthValue || 1280;
        });
        this.player.getVideoHeight().then((heightValue) => {
          this.videoHeight = heightValue || 720;
        });
        let vmStarted = false;
        this.player.on("timeupdate", (event) => {
          if (!vmStarted) {
            this.fire("started", event);
            vmStarted = true;
          }
          this.fire("timeupdate", event);
          if (this.options.endTime && event.seconds >= this.options.endTime) {
            if (this.options.loop) {
              this.play(this.options.startTime);
            } else {
              this.pause();
            }
          }
        });
        this.player.on("play", (event) => {
          this.fire("play", event);
          if (this.options.startTime && event.seconds === 0) {
            this.play(this.options.startTime);
          }
        });
        this.player.on("pause", (event) => {
          this.fire("pause", event);
        });
        this.player.on("ended", (event) => {
          this.fire("ended", event);
        });
        this.player.on("loaded", (event) => {
          this.fire("ready", event);
        });
        this.player.on("volumechange", (event) => {
          this.getVolume((volume) => {
            if (typeof volume === "number") {
              this.options.volume = volume;
            }
          });
          this.fire("volumechange", event);
        });
        this.player.on("error", (event) => {
          this.fire("error", event);
        });
        callback(this.$video);
      });
    }
    destroy() {
      var _a;
      if (this.imageRequest) {
        this.imageRequest.abort();
        this.imageRequest = void 0;
      }
      if ((_a = this.player) == null ? void 0 : _a.destroy) {
        void this.player.destroy();
      }
      super.destroy();
    }
  }

  let YoutubeAPIadded = 0;
  let loadingYoutubePlayer = 0;
  const loadingYoutubeDefer = new Deferred();
  const videoGlobal = global$2;
  function loadAPI() {
    if (YoutubeAPIadded) {
      return;
    }
    YoutubeAPIadded = 1;
    const src = "https://www.youtube.com/iframe_api";
    let tag = document.createElement("script");
    let head = document.getElementsByTagName("head")[0] || null;
    if (!head || !tag) {
      return;
    }
    tag.src = src;
    head.appendChild(tag);
    head = null;
    tag = null;
  }
  function onAPIready(callback) {
    if ((typeof videoGlobal.YT === "undefined" || videoGlobal.YT.loaded === 0) && !loadingYoutubePlayer) {
      loadingYoutubePlayer = 1;
      videoGlobal.onYouTubeIframeAPIReady = () => {
        videoGlobal.onYouTubeIframeAPIReady = null;
        loadingYoutubeDefer.resolve("done");
        callback();
      };
    } else if (typeof videoGlobal.YT === "object" && videoGlobal.YT.loaded === 1) {
      callback();
    } else {
      loadingYoutubeDefer.done(() => {
        callback();
      });
    }
  }
  class VideoWorkerYoutube extends VideoWorkerBase {
    constructor() {
      super(...arguments);
      this.type = "youtube";
    }
    static parseURL(url) {
      const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[1].length === 11 ? match[1] : false;
    }
    init() {
      super.init();
      loadAPI();
    }
    play(start) {
      if (!this.player || !this.player.playVideo || !videoGlobal.YT) {
        return;
      }
      if (typeof start !== "undefined") {
        this.player.seekTo(start || 0);
      }
      if (videoGlobal.YT.PlayerState.PLAYING !== this.player.getPlayerState()) {
        if (this.options.endTime && !this.options.loop) {
          this.getCurrentTime((seconds) => {
            var _a;
            if (seconds < this.options.endTime) {
              (_a = this.player) == null ? void 0 : _a.playVideo();
            }
          });
        } else {
          this.player.playVideo();
        }
      }
    }
    pause() {
      if (!this.player || !this.player.pauseVideo || !videoGlobal.YT) {
        return;
      }
      if (videoGlobal.YT.PlayerState.PLAYING === this.player.getPlayerState()) {
        this.player.pauseVideo();
      }
    }
    mute() {
      if (!this.player || !this.player.mute) {
        return;
      }
      this.player.mute();
    }
    unmute() {
      if (!this.player || !this.player.unMute) {
        return;
      }
      this.player.unMute();
    }
    setVolume(volume = false) {
      if (!this.player || typeof volume !== "number" || !this.player.setVolume) {
        return;
      }
      this.player.setVolume(volume);
    }
    getVolume(callback) {
      if (!this.player) {
        callback(false);
        return;
      }
      if (this.player.getVolume) {
        callback(this.player.getVolume());
      }
    }
    getMuted(callback) {
      if (!this.player) {
        callback(null);
        return;
      }
      if (this.player.isMuted) {
        callback(this.player.isMuted());
      }
    }
    setCurrentTime(currentTime = false) {
      if (!this.player || typeof currentTime !== "number" || !this.player.seekTo) {
        return;
      }
      this.player.seekTo(currentTime);
    }
    getCurrentTime(callback) {
      if (!this.player || !this.player.getCurrentTime) {
        return;
      }
      callback(this.player.getCurrentTime());
    }
    getImageURL(callback) {
      if (this.videoImage) {
        callback(this.videoImage);
        return;
      }
      const availableSizes = ["maxresdefault", "sddefault", "hqdefault", "0"];
      let step = 0;
      const tempImg = new Image();
      tempImg.onload = () => {
        if ((tempImg.naturalWidth || tempImg.width) !== 120 || step === availableSizes.length - 1) {
          this.videoImage = `https://img.youtube.com/vi/${String(this.videoID)}/${availableSizes[step]}.jpg`;
          callback(this.videoImage);
        } else {
          step += 1;
          tempImg.src = `https://img.youtube.com/vi/${String(this.videoID)}/${availableSizes[step]}.jpg`;
        }
      };
      tempImg.src = `https://img.youtube.com/vi/${String(this.videoID)}/${availableSizes[step]}.jpg`;
    }
    getVideo(callback) {
      if (this.destroyed) {
        return;
      }
      if (this.$video) {
        callback(this.$video);
        return;
      }
      onAPIready(() => {
        if (this.destroyed) {
          return;
        }
        let hiddenDiv;
        if (!this.$video) {
          hiddenDiv = document.createElement("div");
          hiddenDiv.style.display = "none";
        }
        this.playerOptions = {
          // GDPR Compliance.
          host: "https://www.youtube-nocookie.com",
          videoId: String(this.videoID),
          playerVars: {
            autohide: 1,
            rel: 0,
            autoplay: 0,
            // autoplay enable on mobile devices
            playsinline: 1
          },
          events: {
            onReady: (event) => {
              if (this.options.mute) {
                event.target.mute();
              } else if (typeof this.options.volume === "number") {
                event.target.setVolume(this.options.volume);
              }
              if (this.options.autoplay) {
                this.play(this.options.startTime);
              }
              this.fire("ready", event);
              if (this.options.loop && !this.options.endTime && this.player) {
                const secondsOffset = 0.1;
                this.options.endTime = this.player.getDuration() - secondsOffset;
              }
              if (this.volumeChangeInterval) {
                clearInterval(this.volumeChangeInterval);
              }
              this.volumeChangeInterval = setInterval(() => {
                this.getVolume((volume) => {
                  if (typeof volume === "number" && this.options.volume !== volume) {
                    this.options.volume = volume;
                    this.fire("volumechange", event);
                  }
                });
              }, 150);
            },
            onStateChange: () => {
            },
            onError: (event) => {
              this.fire("error", event);
            }
          }
        };
        if (!this.options.showControls) {
          this.playerOptions.playerVars.iv_load_policy = 3;
          this.playerOptions.playerVars.modestbranding = 1;
          this.playerOptions.playerVars.controls = 0;
          this.playerOptions.playerVars.showinfo = 0;
          this.playerOptions.playerVars.disablekb = 1;
        }
        let ytStarted = false;
        this.playerOptions.events.onStateChange = (event) => {
          if (!videoGlobal.YT || !this.player) {
            return;
          }
          if (this.options.loop && event.data === videoGlobal.YT.PlayerState.ENDED) {
            this.play(this.options.startTime);
          }
          if (!ytStarted && event.data === videoGlobal.YT.PlayerState.PLAYING) {
            ytStarted = true;
            this.fire("started", event);
          }
          if (event.data === videoGlobal.YT.PlayerState.PLAYING) {
            this.fire("play", event);
          }
          if (event.data === videoGlobal.YT.PlayerState.PAUSED) {
            this.fire("pause", event);
          }
          if (event.data === videoGlobal.YT.PlayerState.ENDED) {
            this.fire("ended", event);
          }
          if (event.data === videoGlobal.YT.PlayerState.PLAYING) {
            if (this.progressInterval) {
              clearInterval(this.progressInterval);
            }
            this.progressInterval = setInterval(() => {
              if (!this.player) {
                return;
              }
              this.fire("timeupdate", event);
              if (this.options.endTime && this.player.getCurrentTime() >= this.options.endTime) {
                if (this.options.loop) {
                  this.play(this.options.startTime);
                } else {
                  this.pause();
                }
              }
            }, 150);
          } else if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = void 0;
          }
        };
        const firstInit = !this.$video;
        if (firstInit && hiddenDiv) {
          this.hiddenContainer = hiddenDiv;
          const div = document.createElement("div");
          div.setAttribute("id", this.playerID);
          hiddenDiv.appendChild(div);
          document.body.appendChild(hiddenDiv);
        }
        this.player = this.player || new videoGlobal.YT.Player(this.playerID, this.playerOptions);
        if (firstInit) {
          this.$video = document.getElementById(this.playerID);
          if (this.$video && this.options.accessibilityHidden) {
            this.$video.setAttribute("tabindex", "-1");
            this.$video.setAttribute("aria-hidden", "true");
          }
          if (this.$video) {
            this.videoWidth = parseInt(this.$video.getAttribute("width") || "1280", 10) || 1280;
            this.videoHeight = parseInt(this.$video.getAttribute("height") || "720", 10) || 720;
          }
        }
        callback(this.$video);
      });
    }
    destroy() {
      var _a;
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = void 0;
      }
      if (this.volumeChangeInterval) {
        clearInterval(this.volumeChangeInterval);
        this.volumeChangeInterval = void 0;
      }
      if ((_a = this.player) == null ? void 0 : _a.destroy) {
        this.player.destroy();
      }
      super.destroy();
    }
  }

  const VideoWorker = function(url, options) {
    let result = false;
    Object.keys(VideoWorker.providers).forEach((key) => {
      if (!result && VideoWorker.providers[key].parseURL(url)) {
        result = new VideoWorker.providers[key](url, options);
      }
    });
    return result || new VideoWorkerBase(url, options);
  };
  VideoWorker.BaseClass = VideoWorkerBase;
  VideoWorker.providers = {
    Youtube: VideoWorkerYoutube,
    Vimeo: VideoWorkerVimeo,
    Local: VideoWorkerLocal
  };

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

  function jarallaxVideo(jarallax = global$1.jarallax) {
    if (typeof jarallax === "undefined") {
      return;
    }
    const Jarallax = jarallax.constructor;
    const defOnScroll = Jarallax.prototype.onScroll;
    Jarallax.prototype.onScroll = function onScrollWithVideo() {
      defOnScroll.apply(this);
      const isReady = !this.isVideoInserted && this.video && (!this.options.videoLazyLoading || this.isElementInViewport) && !this.options.disableVideo();
      if (!isReady) {
        return;
      }
      this.isVideoInserted = true;
      this.video?.getVideo((video) => {
        const insertedVideo = video;
        const parent = insertedVideo.parentNode;
        this.css(insertedVideo, {
          position: this.image.position,
          top: "0px",
          left: "0px",
          right: "0px",
          bottom: "0px",
          width: "100%",
          height: "100%",
          maxWidth: "none",
          maxHeight: "none",
          pointerEvents: "none",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          margin: 0,
          zIndex: -1
        });
        this.$video = insertedVideo;
        if (this.video?.type === "local") {
          if (this.image.src) {
            insertedVideo.setAttribute("poster", this.image.src);
          } else if (this.image.$item?.tagName === "IMG") {
            insertedVideo.setAttribute("poster", this.image.$item.src);
          }
        }
        if (this.options.videoClass) {
          insertedVideo.setAttribute(
            "class",
            `${this.options.videoClass} ${this.options.videoClass}-${this.video?.type}`
          );
        }
        this.image.$container?.appendChild(insertedVideo);
        parent?.parentNode?.removeChild(parent);
        this.options.onVideoInsert?.call(this);
      });
    };
    const defCoverImage = Jarallax.prototype.coverImage;
    Jarallax.prototype.coverImage = function coverVideo() {
      const imageData = defCoverImage.apply(this);
      const node = this.image.$item?.nodeName;
      if (!imageData || imageData === true || !this.video || !node || node !== "IFRAME" && node !== "VIDEO" || !this.$video) {
        return imageData;
      }
      let h = imageData.image.height;
      let w = h * (this.image.width || 0) / (this.image.height || 1);
      let ml = (imageData.container.width - w) / 2;
      let mt = imageData.image.marginTop;
      if (imageData.container.width > w) {
        w = imageData.container.width;
        h = w * (this.image.height || 0) / (this.image.width || 1);
        ml = 0;
        mt += (imageData.image.height - h) / 2;
      }
      if (node === "IFRAME") {
        h += 400;
        mt -= 200;
      }
      this.css(this.$video, {
        width: `${w}px`,
        marginLeft: `${ml}px`,
        height: `${h}px`,
        marginTop: `${mt}px`
      });
      return imageData;
    };
    const defInitImg = Jarallax.prototype.initImg;
    Jarallax.prototype.initImg = function initVideoImage() {
      const defaultResult = defInitImg.apply(this);
      if (!this.options.videoSrc) {
        this.options.videoSrc = this.$item.getAttribute("data-jarallax-video") || null;
      }
      if (this.options.videoSrc) {
        this.defaultInitImgResult = defaultResult;
        return true;
      }
      return defaultResult;
    };
    const defCanInitParallax = Jarallax.prototype.canInitParallax;
    Jarallax.prototype.canInitParallax = function canInitVideoParallax() {
      let defaultResult = defCanInitParallax.apply(this);
      if (!this.options.videoSrc) {
        return defaultResult;
      }
      const video = new VideoWorker(this.options.videoSrc, {
        autoplay: true,
        loop: this.options.videoLoop,
        showControls: false,
        accessibilityHidden: true,
        startTime: Number(this.options.videoStartTime || 0),
        endTime: Number(this.options.videoEndTime || 0),
        mute: !this.options.videoVolume,
        volume: Number(this.options.videoVolume || 0)
      });
      this.options.onVideoWorkerInit?.call(this, video);
      const resetDefaultImage = () => {
        if (this.image.$default_item) {
          this.image.$item = this.image.$default_item;
          this.image.$item.style.display = "block";
          this.coverImage();
          this.onScroll();
        }
      };
      if (!video.isValid()) {
        return defaultResult;
      }
      if (this.options.disableParallax()) {
        defaultResult = true;
        this.image.position = "absolute";
        this.options.type = "scroll";
        this.options.speed = 1;
      }
      if (!defaultResult) {
        if (!this.defaultInitImgResult) {
          video.getImageURL((url) => {
            const currentStyle = this.$item.getAttribute("style");
            if (currentStyle) {
              this.$item.setAttribute("data-jarallax-original-styles", currentStyle);
            }
            this.css(this.$item, {
              backgroundImage: `url("${url}")`,
              backgroundPosition: "center",
              backgroundSize: "cover"
            });
          });
        }
        return defaultResult;
      }
      video.on("ready", () => {
        if (this.options.videoPlayOnlyVisible) {
          const oldOnScroll = this.onScroll;
          this.onScroll = function onScrollPlayVideo() {
            oldOnScroll.apply(this);
            if (!this.videoError && (this.options.videoLoop || !this.options.videoLoop && !this.videoEnded)) {
              if (this.isVisible()) {
                video.play();
              } else {
                video.pause();
              }
            }
          };
        } else {
          video.play();
        }
      });
      video.on("started", () => {
        this.image.$default_item = this.image.$item;
        this.image.$item = this.$video;
        this.image.width = this.video?.videoWidth || 1280;
        this.image.height = this.video?.videoHeight || 720;
        this.coverImage();
        this.onScroll();
        if (this.image.$default_item) {
          this.image.$default_item.style.display = "none";
        }
      });
      video.on("ended", () => {
        this.videoEnded = true;
        if (!this.options.videoLoop) {
          resetDefaultImage();
        }
      });
      video.on("error", () => {
        this.videoError = true;
        resetDefaultImage();
      });
      this.video = video;
      if (!this.defaultInitImgResult) {
        this.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        if (video.type !== "local") {
          video.getImageURL((url) => {
            this.image.bgImage = `url("${url}")`;
            this.init();
          });
          return false;
        }
      }
      return defaultResult;
    };
    const defDestroy = Jarallax.prototype.destroy;
    Jarallax.prototype.destroy = function destroyVideo() {
      if (this.image.$default_item) {
        this.image.$item = this.image.$default_item;
        delete this.image.$default_item;
      }
      defDestroy.apply(this);
    };
  }

  jarallaxVideo();
  ready(() => {
    if (typeof global$1.jarallax !== "undefined") {
      global$1.jarallax(document.querySelectorAll("[data-jarallax-video]"));
    }
  });
  if (!global$1.VideoWorker) {
    global$1.VideoWorker = VideoWorker;
  }

  return jarallaxVideo;

}));
//# sourceMappingURL=jarallax-video.js.map
