import VideoWorker from 'video-worker';
import global from 'global';

export default function jarallaxVideo( jarallax = global.jarallax ) {
    if ( 'undefined' === typeof jarallax ) {
        return;
    }

    const Jarallax = jarallax.constructor;

    // append video after when block will be visible.
    const defOnScroll = Jarallax.prototype.onScroll;
    Jarallax.prototype.onScroll = function() {
        const self = this;

        defOnScroll.apply( self );

        const isReady = ! self.isVideoInserted
                        && self.video
                        && ( ! self.options.videoLazyLoading || self.isElementInViewport )
                        && ! self.options.disableVideo();

        if ( isReady ) {
            self.isVideoInserted = true;

            self.video.getVideo( ( video ) => {
                const $parent = video.parentNode;
                self.css( video, {
                    position: self.image.position,
                    top: '0px',
                    left: '0px',
                    right: '0px',
                    bottom: '0px',
                    width: '100%',
                    height: '100%',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    pointerEvents: 'none',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    willChange: 'transform,opacity',
                    margin: 0,
                    zIndex: -1,
                } );
                self.$video = video;

                // add Poster attribute to self-hosted video
                if ( 'local' === self.video.type ) {
                    if ( self.image.src ) {
                        self.$video.setAttribute( 'poster', self.image.src );
                    } else if ( self.image.$item && 'IMG' === self.image.$item.tagName && self.image.$item.src ) {
                        self.$video.setAttribute( 'poster', self.image.$item.src );
                    }
                }

                // insert video tag
                self.image.$container.appendChild( video );

                // remove parent video element (created by VideoWorker)
                $parent.parentNode.removeChild( $parent );
            } );
        }
    };

    // cover video
    const defCoverImage = Jarallax.prototype.coverImage;
    Jarallax.prototype.coverImage = function() {
        const self = this;
        const imageData = defCoverImage.apply( self );
        const node = self.image.$item ? self.image.$item.nodeName : false;

        if ( imageData && self.video && node && ( 'IFRAME' === node || 'VIDEO' === node ) ) {
            let h = imageData.image.height;
            let w = ( h * self.image.width ) / self.image.height;
            let ml = ( imageData.container.width - w ) / 2;
            let mt = imageData.image.marginTop;

            if ( imageData.container.width > w ) {
                w = imageData.container.width;
                h = ( w * self.image.height ) / self.image.width;
                ml = 0;
                mt += ( imageData.image.height - h ) / 2;
            }

            // add video height over than need to hide controls
            if ( 'IFRAME' === node ) {
                h += 400;
                mt -= 200;
            }

            self.css( self.$video, {
                width: `${ w }px`,
                marginLeft: `${ ml }px`,
                height: `${ h }px`,
                marginTop: `${ mt }px`,
            } );
        }

        return imageData;
    };

    // init video
    const defInitImg = Jarallax.prototype.initImg;
    Jarallax.prototype.initImg = function() {
        const self = this;
        const defaultResult = defInitImg.apply( self );

        if ( ! self.options.videoSrc ) {
            self.options.videoSrc = self.$item.getAttribute( 'data-jarallax-video' ) || null;
        }

        if ( self.options.videoSrc ) {
            self.defaultInitImgResult = defaultResult;
            return true;
        }

        return defaultResult;
    };

    const defCanInitParallax = Jarallax.prototype.canInitParallax;
    Jarallax.prototype.canInitParallax = function() {
        const self = this;
        let defaultResult = defCanInitParallax.apply( self );

        if ( ! self.options.videoSrc ) {
            return defaultResult;
        }

        // Init video api
        const video = new VideoWorker( self.options.videoSrc, {
            autoplay: true,
            loop: self.options.videoLoop,
            showContols: false,
            startTime: self.options.videoStartTime || 0,
            endTime: self.options.videoEndTime || 0,
            mute: self.options.videoVolume ? 0 : 1,
            volume: self.options.videoVolume || 0,
        } );

        function resetDefaultImage() {
            if ( self.image.$default_item ) {
                self.image.$item = self.image.$default_item;
                self.image.$item.style.display = 'block';

                // set image width and height
                self.coverImage();
                self.clipContainer();
                self.onScroll();
            }
        }

        if ( video.isValid() ) {
            // Force enable parallax.
            // When the parallax disabled on mobile devices, we still need to display videos.
            // https://github.com/nk-o/jarallax/issues/159
            if ( this.options.disableParallax() ) {
                defaultResult = true;
                self.image.position = 'absolute';
                self.options.type = 'scroll';
                self.options.speed = 1;
            }

            // if parallax will not be inited, we can add thumbnail on background.
            if ( ! defaultResult ) {
                if ( ! self.defaultInitImgResult ) {
                    video.getImageURL( ( url ) => {
                        // save default user styles
                        const curStyle = self.$item.getAttribute( 'style' );
                        if ( curStyle ) {
                            self.$item.setAttribute( 'data-jarallax-original-styles', curStyle );
                        }

                        // set new background
                        self.css( self.$item, {
                            'background-image': `url("${ url }")`,
                            'background-position': 'center',
                            'background-size': 'cover',
                        } );
                    } );
                }

                // init video
            } else {
                video.on( 'ready', () => {
                    if ( self.options.videoPlayOnlyVisible ) {
                        const oldOnScroll = self.onScroll;
                        self.onScroll = function() {
                            oldOnScroll.apply( self );
                            if ( ! self.videoError && ( self.options.videoLoop || ( ! self.options.videoLoop && ! self.videoEnded ) ) ) {
                                if ( self.isVisible() ) {
                                    video.play();
                                } else {
                                    video.pause();
                                }
                            }
                        };
                    } else {
                        video.play();
                    }
                } );
                video.on( 'started', () => {
                    self.image.$default_item = self.image.$item;
                    self.image.$item = self.$video;

                    // set video width and height
                    self.image.width = self.video.videoWidth || 1280;
                    self.image.height = self.video.videoHeight || 720;
                    self.coverImage();
                    self.clipContainer();
                    self.onScroll();

                    // hide image
                    if ( self.image.$default_item ) {
                        self.image.$default_item.style.display = 'none';
                    }
                } );

                video.on( 'ended', () => {
                    self.videoEnded = true;

                    if ( ! self.options.videoLoop ) {
                        // show default image if Loop disabled.
                        resetDefaultImage();
                    }
                } );
                video.on( 'error', () => {
                    self.videoError = true;

                    // show default image if video loading error.
                    resetDefaultImage();
                } );

                self.video = video;

                // set image if not exists
                if ( ! self.defaultInitImgResult ) {
                    // set empty image on self-hosted video if not defined
                    self.image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

                    if ( 'local' !== video.type ) {
                        video.getImageURL( ( url ) => {
                            self.image.bgImage = `url("${ url }")`;
                            self.init();
                        } );

                        return false;
                    }
                }
            }
        }

        return defaultResult;
    };

    // Destroy video parallax
    const defDestroy = Jarallax.prototype.destroy;
    Jarallax.prototype.destroy = function() {
        const self = this;

        if ( self.image.$default_item ) {
            self.image.$item = self.image.$default_item;
            delete self.image.$default_item;
        }

        defDestroy.apply( self );
    };
}
