/*!
 * Name    : Video Worker (wrapper for Youtube and Vimeo)
 * Version : 1.1.0
 * Author  : _nK http://nkdev.info
 * GitHub  : https://github.com/nk-o/jarallax
 */
(function (window) {
    'use strict';

    // Extend like jQuery.extend
    function extend (out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i]) {
                continue;
            }
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    out[key] = arguments[i][key];
                }
            }
        }
        return out;
    }

    // Deffered
    // thanks http://stackoverflow.com/questions/18096715/implement-deferred-object-without-using-jquery
    function Deferred () {
        this._done = [];
        this._fail = [];
    }
    Deferred.prototype = {
        execute: function (list, args) {
            var i = list.length;
            args = Array.prototype.slice.call(args);
            while(i--) {
                list[i].apply(null, args);
            }
        },
        resolve: function () {
            this.execute(this._done, arguments);
        },
        reject: function () {
            this.execute(this._fail, arguments);
        },
        done: function (callback) {
            this._done.push(callback);
        },
        fail: function (callback) {
            this._fail.push(callback);
        }
    };

    var VideoWorker = (function () {
        var ID = 0;

        function VideoWorker_inner (url, options) {
            var _this = this;

            _this.url = url;

            _this.options_default = {
                autoplay: 1,
                loop: 1,
                mute: 1,
                controls: 0
            };

            _this.options = extend({}, _this.options_default, options);

            // check URL
            _this.videoID = _this.parseURL(url);

            // init
            if(_this.videoID) {
                _this.ID = ID++;
                _this.loadAPI();
                _this.init();
            }
        }

        return VideoWorker_inner;
    }());

    VideoWorker.prototype.parseURL = function (url) {
        // parse youtube ID
        function getYoutubeID (ytUrl) {
            var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
            var match = ytUrl.match(regExp);
            return match && match[1].length === 11 ? match[1] : false;
        }

        // parse vimeo ID
        function getVimeoID (vmUrl) {
            var regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
            var match = vmUrl.match(regExp);
            return match && match[3] ? match[3] : false;
        }

        var Youtube = getYoutubeID(url);
        var Vimeo = getVimeoID(url);

        if(Youtube) {
            this.type = 'youtube';
            return Youtube;
        } else if (Vimeo) {
            this.type = 'vimeo';
            return Vimeo;
        }

        return false;
    };

    VideoWorker.prototype.isValid = function () {
        return !!this.videoID;
    };

    // events
    VideoWorker.prototype.on = function (name, callback) {
        this.userEventsList = this.userEventsList || [];

        // add new callback in events list
        (this.userEventsList[name] || (this.userEventsList[name] = [])).push(callback);
    };
    VideoWorker.prototype.off = function (name, callback) {
        if(!this.userEventsList || !this.userEventsList[name]) {
            return;
        }

        if(!callback) {
            delete this.userEventsList[name];
        } else {
            for(var k = 0; k < this.userEventsList[name].length; k++) {
                if(this.userEventsList[name][k] === callback) {
                    this.userEventsList[name][k] = false;
                }
            }
        }
    };
    VideoWorker.prototype.fire = function (name) {
        var args = [].slice.call(arguments, 1);
        if(this.userEventsList && typeof this.userEventsList[name] !== 'undefined') {
            for(var k in this.userEventsList[name]) {
                // call with all arguments
                if(this.userEventsList[name][k]) {
                    this.userEventsList[name][k].apply(this, args);
                }
            }
        }
    };

    VideoWorker.prototype.play = function () {
        if(!this.player) {
            return;
        }

        if(this.type === 'youtube' && this.player.playVideo) {
            this.player.playVideo();
        }

        if(this.type === 'vimeo') {
            this.player.api('play');
        }
    };

    VideoWorker.prototype.pause = function () {
        if(!this.player) {
            return;
        }

        if(this.type === 'youtube' && this.player.pauseVideo) {
            this.player.pauseVideo();
        }

        if(this.type === 'vimeo') {
            this.player.api('pause');
        }
    };

    VideoWorker.prototype.getImageURL = function (callback) {
        var _this = this;

        if(_this.videoImage) {
            callback(_this.videoImage);
            return;
        }

        if(_this.type === 'youtube') {
            _this.videoImage = 'https://img.youtube.com/vi/' + _this.videoID + '/maxresdefault.jpg';
            callback(_this.videoImage);
        }

        if(_this.type === 'vimeo') {
            var request = new XMLHttpRequest();
            request.open('GET', 'https://vimeo.com/api/v2/video/' + _this.videoID + '.json', true);
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status >= 200 && this.status < 400) {
                        // Success!
                        var response = JSON.parse(this.responseText);
                        _this.videoImage = response[0].thumbnail_large;
                        callback(_this.videoImage);
                    } else {
                        // Error :(
                    }
                }
            };
            request.send();
            request = null;
        }
    };

    VideoWorker.prototype.getIframe = function (callback) {
        var _this = this;

        // return generated iframe
        if(_this.$iframe) {
            callback(_this.$iframe);
            return;
        }

        // generate new iframe
        _this.onAPIready(function () {
            var hiddenDiv;
            if(!_this.$iframe) {
                hiddenDiv = document.createElement('div');
                hiddenDiv.style.display = 'none';
            }

            // Youtube
            if(_this.type === 'youtube') {
                _this.playerOptions = {};
                _this.playerOptions.videoId = _this.videoID;
                _this.playerOptions.width = window.innerWidth || document.documentElement.clientWidth;
                _this.playerOptions.playerVars = {
                    autohide: 1,
                    rel: 0,
                    autoplay: 0
                };

                // hide controls
                if(!_this.options.controls) {
                    _this.playerOptions.playerVars.iv_load_policy = 3;
                    _this.playerOptions.playerVars.modestbranding = 1;
                    _this.playerOptions.playerVars.controls = 0;
                    _this.playerOptions.playerVars.showinfo = 0;
                    _this.playerOptions.playerVars.disablekb = 1;
                }

                // events
                var ytStarted;
                _this.playerOptions.events = {
                    onReady: function (e) {
                        // mute
                        if(_this.options.mute) {
                            e.target.mute();
                        }
                        // autoplay
                        if(_this.options.autoplay) {
                            _this.play();
                        }
                        _this.fire('ready', e);
                    },
                    onStateChange: function (e) {
                        // loop
                        if(_this.options.loop && e.data === YT.PlayerState.ENDED) {
                            e.target.playVideo();
                        }
                        if(!ytStarted && e.data === YT.PlayerState.PLAYING) {
                            ytStarted = 1;
                            _this.fire('started', e);
                        }
                    }
                };

                var firstInit = !_this.$iframe;
                if(firstInit) {
                    var div = document.createElement('div');
                    div.setAttribute('id', _this.playerID);
                    hiddenDiv.appendChild(div);
                    document.body.appendChild(hiddenDiv);
                }
                _this.player = _this.player || new window.YT.Player(_this.playerID, _this.playerOptions);
                if(firstInit) {
                    _this.$iframe = document.getElementById(_this.playerID);
                }
            }

            // Vimeo
            if(_this.type === 'vimeo') {
                _this.playerOptions = '';

                _this.playerOptions += 'player_id=' + _this.playerID;
                _this.playerOptions += '&autopause=0';

                // hide controls
                if(!_this.options.controls) {
                    _this.playerOptions += '&badge=0&byline=0&portrait=0&title=0';
                }

                // autoplay
                _this.playerOptions += '&autoplay=0';

                // loop
                _this.playerOptions += '&loop=' + (_this.options.loop ? 1 : 0);

                if(!_this.$iframe) {
                    _this.$iframe = document.createElement('iframe');
                    _this.$iframe.setAttribute('id', _this.playerID);
                    _this.$iframe.setAttribute('src', 'https://player.vimeo.com/video/' + _this.videoID + '?' + _this.playerOptions);
                    _this.$iframe.setAttribute('frameborder', '0');
                    hiddenDiv.appendChild(_this.$iframe);
                    document.body.appendChild(hiddenDiv);
                }

                _this.player = _this.player || $f(_this.$iframe);

                _this.player.addEvent('ready', function (eventReady) {
                    // mute
                    _this.player.api('setVolume', _this.options.mute ? 0 : 100);

                    // autoplay
                    if(_this.options.autoplay) {
                        _this.play();
                    }

                    var vmStarted;
                    _this.player.addEvent('playProgress', function (eventPlay) {
                        if(!vmStarted) {
                            _this.fire('started', eventPlay);
                        }
                        vmStarted = 1;
                    });

                    _this.fire('ready', eventReady);
                });
            }

            callback(_this.$iframe);
        });
    };

    VideoWorker.prototype.init = function () {
        var _this = this;

        _this.playerID = 'VideoWorker-' + _this.ID;
    };

    var YoutubeAPIadded = 0;
    var VimeoAPIadded = 0;
    VideoWorker.prototype.loadAPI = function () {
        var _this = this;

        if(YoutubeAPIadded && VimeoAPIadded) {
            return;
        }

        var src = '';

        // load Youtube API
        if(_this.type === 'youtube' && !YoutubeAPIadded) {
            YoutubeAPIadded = 1;
            src = '//www.youtube.com/iframe_api';
        }

        // load Vimeo API
        if(_this.type === 'vimeo' && !VimeoAPIadded) {
            VimeoAPIadded = 1;
            src = '//f.vimeocdn.com/js/froogaloop2.min.js';
        }

        if (window.location.origin === 'file://') {
            src = 'http:' + src;
        }

        // add script in head section
        var tag = document.createElement('script');
        var head = document.getElementsByTagName('head')[0];
        tag.src = src;

        head.appendChild(tag);

        head = null;
        tag = null;
    };

    var loadingYoutubePlayer = 0;
    var loadingVimeoPlayer = 0;
    var loadingYoutubeDeffer = new Deferred();
    var loadingVimeoDeffer = new Deferred();
    VideoWorker.prototype.onAPIready = function (callback) {
        var _this = this;

        // Youtube
        if(_this.type === 'youtube') {
            // Listen for Gobal YT player callback
            if ((typeof YT === 'undefined' || YT.loaded === 0) && !loadingYoutubePlayer) {
                // Prevents Ready Event from being called twice
                loadingYoutubePlayer = 1;

                // Creates deferred so, other players know when to wait.
                window.onYouTubeIframeAPIReady = function () {
                    window.onYouTubeIframeAPIReady = null;
                    loadingYoutubeDeffer.resolve('done');
                    callback();
                };
            } else if (typeof YT === 'object' && YT.loaded === 1)  {
                callback();
            } else {
                loadingYoutubeDeffer.done(function () {
                    callback();
                });
            }
        }

        // Vimeo
        if(_this.type === 'vimeo') {
            if(typeof $f === 'undefined' && !loadingVimeoPlayer) {
                loadingVimeoPlayer = 1;
                var frooga_interval = setInterval(function () {
                    if(typeof $f !== 'undefined') {
                        clearInterval(frooga_interval);
                        loadingVimeoDeffer.resolve('done');
                        callback();
                    }
                }, 20);
            } else if(typeof $f !== 'undefined') {
                callback();
            } else {
                loadingVimeoDeffer.done(function () {
                    callback();
                });
            }
        }
    };

    window.VideoWorker = VideoWorker;
}(window));



/*!
 * Name    : Video Background Extension for Jarallax
 * Version : 1.0.0
 * Author  : _nK http://nkdev.info
 * GitHub  : https://github.com/nk-o/jarallax
 */
(function () {
    'use strict';

    if(typeof jarallax === 'undefined') {
        return;
    }

    var Jarallax = jarallax.constructor;

    // append video after init Jarallax
    var def_init = Jarallax.prototype.init;
    Jarallax.prototype.init = function () {
        var _this = this;

        def_init.apply(_this);

        if(_this.video) {
            _this.video.getIframe(function (iframe) {
                _this.css(iframe, {
                    position: 'fixed',
                    top: '0px', left: '0px', right: '0px', bottom: '0px',
                    width: '100%',
                    height: '100%',
                    visibility: 'visible',
                    zIndex: -1
                });
                _this.$video = iframe;
                _this.image.$container.appendChild(iframe);
            });
        }
    };

    // append video after init Jarallax
    var def_coverImage = Jarallax.prototype.coverImage;
    Jarallax.prototype.coverImage = function () {
        var _this = this;

        def_coverImage.apply(_this);

        // add video height over than need to hide controls
        if(_this.video && _this.image.$item.nodeName === 'IFRAME') {
            _this.css(_this.image.$item, {
                height: _this.image.$item.getBoundingClientRect().height + 400 + 'px',
                top: '-200px'
            });
        }
    };

    // init video parallax
    var def_initImg = Jarallax.prototype.initImg;
    Jarallax.prototype.initImg = function () {
        var _this = this;

        if(!_this.options.videoSrc) {
            _this.options.videoSrc = _this.$item.getAttribute('data-jarallax-video') || false;
        }

        if(_this.options.videoSrc) {
            var video = new VideoWorker(_this.options.videoSrc);

            if(video.isValid()) {
                _this.image.useImgTag = true;

                video.on('ready', function () {
                    var oldOnScroll = _this.onScroll;
                    _this.onScroll = function () {
                        oldOnScroll.apply(_this);
                        if(_this.isVisible()) {
                            video.play();
                        } else {
                            video.pause();
                        }
                    };
                });

                video.on('started', function () {
                    _this.image.$default_item = _this.image.$item;
                    _this.image.$item = _this.$video;

                    // set video width and height
                    _this.image.width  = _this.imgWidth = 1280;
                    _this.image.height = _this.imgHeight = 720;
                    _this.coverImage();
                    _this.clipContainer();
                    _this.onScroll();

                    // hide image
                    if(_this.image.$default_item) {
                        _this.image.$default_item.style.display = 'none';
                    }
                });

                _this.video = video;

                video.getImageURL(function (url) {
                    _this.image.src = url;
                    _this.init();
                });
            }

            return false;
        }

        return def_initImg.apply(_this);
    };

    // Destroy video parallax
    var def_destroy = Jarallax.prototype.destroy;
    Jarallax.prototype.destroy = function () {
        var _this = this;

        def_destroy.apply(_this);
    };
}());
