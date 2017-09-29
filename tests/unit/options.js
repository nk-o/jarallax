QUnit.module('options', function () {
    QUnit.test('default options', function (assert) {
        assert.expect(1);

        var $jarallax = UTILS.get('background')[0];
        jarallax($jarallax);

        var options = $jarallax.jarallax.options;

        assert.deepEqual({
            type: options.type,
            speed: options.speed,
            imgSrc: options.imgSrc,
            imgElement: options.imgElement,
            imgSize: options.imgSize,
            imgPosition: options.imgPosition,
            imgRepeat: options.imgRepeat,
            elementInViewport: options.elementInViewport,
            zIndex: options.zIndex,
            noAndroid: options.noAndroid,
            noIos: options.noIos,
            videoSrc: options.videoSrc,
            videoStartTime: options.videoStartTime,
            videoEndTime: options.videoEndTime,
            videoVolume: options.videoVolume,
            videoPlayOnlyVisible: options.videoPlayOnlyVisible,
            onScroll: options.onScroll,
            onInit: options.onInit,
            onDestroy: options.onDestroy,
            onCoverImage: options.onCoverImage,
        }, {
            type: 'scroll',
            speed: 0.5,
            imgSrc: null,
            imgElement: '.jarallax-img',
            imgSize: 'cover',
            imgPosition: '50% 50%',
            imgRepeat: 'no-repeat',
            elementInViewport: null,
            zIndex: -100,
            noAndroid: false,
            noIos: false,
            videoSrc: null,
            videoStartTime: 0,
            videoEndTime: 0,
            videoVolume: 0,
            videoPlayOnlyVisible: true,
            onScroll: null,
            onInit: null,
            onDestroy: null,
            onCoverImage: null,
        });
    });


    QUnit.test('custom options', function (assert) {
        assert.expect(1);

        function onScroll() {
            return 1;
        }
        function onInit() {
            return 2;
        }
        function onDestroy() {
            return 3;
        }
        function onCoverImage() {
            return 4;
        }

        var $jarallax = UTILS.get('background')[0];

        var customOptions = {
            type: 'opacity',
            speed: -0.3,
            imgSrc: UTILS.image,
            imgElement: '.jarallax-img-test',
            imgSize: 'contain',
            imgPosition: 'center',
            imgRepeat: 'repeat',
            elementInViewport: $jarallax,
            zIndex: -101,
            noAndroid: true,
            noIos: true,
            videoSrc: 'https://youtu.be/mru3Q5m4lkY',
            videoStartTime: 10,
            videoEndTime: 20,
            videoVolume: 30,
            videoPlayOnlyVisible: false,
            onScroll: onScroll,
            onInit: onInit,
            onDestroy: onDestroy,
            onCoverImage: onCoverImage,
        };

        jarallax($jarallax, customOptions);

        var options = $jarallax.jarallax.options;

        assert.deepEqual({
            type: options.type,
            speed: options.speed,
            imgSrc: options.imgSrc,
            imgElement: options.imgElement,
            imgSize: options.imgSize,
            imgPosition: options.imgPosition,
            imgRepeat: options.imgRepeat,
            elementInViewport: options.elementInViewport,
            zIndex: options.zIndex,
            noAndroid: options.noAndroid,
            noIos: options.noIos,
            videoSrc: options.videoSrc,
            videoStartTime: options.videoStartTime,
            videoEndTime: options.videoEndTime,
            videoVolume: options.videoVolume,
            videoPlayOnlyVisible: options.videoPlayOnlyVisible,
            onScroll: options.onScroll,
            onInit: options.onInit,
            onDestroy: options.onDestroy,
            onCoverImage: options.onCoverImage,
        }, customOptions);
    });


    QUnit.test('data-* options', function (assert) {
        assert.expect(1);

        var $jarallax = UTILS.get('background')[0];

        $($jarallax).attr({
            'data-type': 'scale',
            'data-speed': '1.3',
            'data-img-src': UTILS.image,
            'data-img-element': '.jarallax-img-test',
            'data-img-size': 'fill',
            'data-img-position': 'top',
            'data-img-repeat': 'repeat',
            'data-z-index': '-102',
            'data-no-android': 'true',
            'data-no-ios': 'true',
            'data-video-src': 'https://youtu.be/mru3Q5m4lkY',
            'data-video-start-time': '10',
            'data-video-end-time': '20',
            'data-video-volume': '30',
            'data-video-play-only-visible': 'false',
        });

        jarallax($jarallax);

        var options = $jarallax.jarallax.options;

        assert.deepEqual({
            type: options.type,
            speed: options.speed,
            imgSrc: options.imgSrc,
            imgElement: options.imgElement,
            imgSize: options.imgSize,
            imgPosition: options.imgPosition,
            imgRepeat: options.imgRepeat,
            zIndex: options.zIndex,
            noAndroid: options.noAndroid,
            noIos: options.noIos,
            videoSrc: options.videoSrc,
            videoStartTime: options.videoStartTime,
            videoEndTime: options.videoEndTime,
            videoVolume: options.videoVolume,
            videoPlayOnlyVisible: options.videoPlayOnlyVisible,
        }, {
            type: 'scale',
            speed: 1.3,
            imgSrc: UTILS.image,
            imgElement: '.jarallax-img-test',
            imgSize: 'fill',
            imgPosition: 'top',
            imgRepeat: 'repeat',
            zIndex: '-102',
            noAndroid: true,
            noIos: true,
            videoSrc: 'https://youtu.be/mru3Q5m4lkY',
            videoStartTime: '10',
            videoEndTime: '20',
            videoVolume: '30',
            videoPlayOnlyVisible: false,
        });
    });


    QUnit.test('cascading options', function (assert) {
        assert.expect(1);

        var $jarallax = UTILS.get('background')[0];

        $($jarallax).attr({
            'data-speed': '1.3',
        });

        jarallax($jarallax, {
            speed: 0.9,
        });

        assert.equal($jarallax.jarallax.options.speed, 0.9);
    });


    QUnit.test('speed option correction', function (assert) {
        assert.expect(2);

        var $jarallax = UTILS.get('background')[0];

        jarallax($jarallax, {
            speed: 2.1,
        });

        assert.equal($jarallax.jarallax.options.speed, 2, 'speed option max 2');

        jarallax($jarallax, 'destroy');
        jarallax($jarallax, {
            speed: -1.5,
        });

        assert.equal($jarallax.jarallax.options.speed, -1, 'speed option min -1');
    });
});
