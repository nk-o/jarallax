QUnit.module( 'video', function() {
    QUnit.test( 'parse urls', function( assert ) {
        assert.expect( 7 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        jarallax( $jarallax, {
            videoSrc: 'https://youtu.be/mru3Q5m4lkY',
        } );
        assert.equal( $jarallax.jarallax.video.videoID, 'mru3Q5m4lkY', 'https://youtu.be/mru3Q5m4lkY' );

        jarallax( $jarallax, 'destroy' );
        jarallax( $jarallax, {
            videoSrc: 'http://www.youtube.com/watch?v=mru3Q5m4lkY',
        } );
        assert.equal( $jarallax.jarallax.video.videoID, 'mru3Q5m4lkY', 'http://www.youtube.com/watch?v=mru3Q5m4lkY' );

        jarallax( $jarallax, 'destroy' );
        jarallax( $jarallax, {
            videoSrc: 'www.youtube.com/embed/mru3Q5m4lkY',
        } );
        assert.equal( $jarallax.jarallax.video.videoID, 'mru3Q5m4lkY', 'youtube.com/embed/mru3Q5m4lkY' );

        jarallax( $jarallax, 'destroy' );
        jarallax( $jarallax, {
            videoSrc: 'https://vimeo.com/235212527',
        } );
        assert.equal( $jarallax.jarallax.video.videoID, '235212527', 'https://vimeo.com/235212527' );

        jarallax( $jarallax, 'destroy' );
        jarallax( $jarallax, {
            videoSrc: 'http://vimeo.com/235212527',
        } );
        assert.equal( $jarallax.jarallax.video.videoID, '235212527', 'http://vimeo.com/235212527' );

        jarallax( $jarallax, 'destroy' );
        jarallax( $jarallax, {
            videoSrc: 'https://player.vimeo.com/video/235212527?byline=0&portrait=0',
        } );
        assert.equal( $jarallax.jarallax.video.videoID, '235212527', 'https://player.vimeo.com/video/235212527?byline=0&portrait=0' );

        jarallax( $jarallax, 'destroy' );
        jarallax( $jarallax, {
            videoSrc: 'mp4:../demo/video/local-video.mp4,webm:../demo/video/local-video.webm,ogv:../demo/video/local-video.ogv',
        } );
        assert.deepEqual( $jarallax.jarallax.video.videoID, {
            mp4: '../demo/video/local-video.mp4',
            webm: '../demo/video/local-video.webm',
            ogg: '../demo/video/local-video.ogv',
        }, 'mp4:../demo/video/local-video.mp4,webm:../demo/video/local-video.webm,ogv:../demo/video/local-video.ogv' );
    } );

    QUnit.test( 'youtube loading', function( assert ) {
        assert.expect( 1 );
        assert.timeout( 10000 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        jarallax( $jarallax, {
            videoSrc: 'https://youtu.be/mru3Q5m4lkY',
        } );

        var done = assert.async();

        var interval1 = setInterval( function() {
            if ( $( $jarallax ).find( 'iframe' ).length ) {
                clearInterval( interval1 );
                assert.ok( true );
                done();
            }
        }, 200 );
    } );

    QUnit.test( 'vimeo loading', function( assert ) {
        assert.expect( 1 );
        assert.timeout( 10000 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        jarallax( $jarallax, {
            videoSrc: 'https://vimeo.com/235212527',
        } );

        var done = assert.async();

        var interval1 = setInterval( function() {
            if ( $( $jarallax ).find( 'iframe' ).length ) {
                clearInterval( interval1 );
                assert.ok( true );
                done();
            }
        }, 200 );
    } );

    QUnit.test( 'local video loading', function( assert ) {
        assert.expect( 1 );
        assert.timeout( 10000 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        jarallax( $jarallax, {
            videoSrc: 'mp4:../demo/video/local-video.mp4,webm:../demo/video/local-video.webm,ogv:../demo/video/local-video.ogv',
        } );

        var done = assert.async();

        var interval1 = setInterval( function() {
            if ( $( $jarallax ).find( 'video' ).length ) {
                clearInterval( interval1 );
                assert.ok( true );
                done();
            }
        }, 200 );
    } );
} );
