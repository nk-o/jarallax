QUnit.module( 'events', function() {
    QUnit.test( 'call', function( assert ) {
        assert.expect( 4 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        var scrollOnce;
        var coverOnce;
        jarallax( $jarallax, {
            onScroll: function() {
                if ( ! scrollOnce ) {
                    assert.ok( 1, 'scroll' );
                    scrollOnce = 1;
                }
            },
            onInit: function() {
                assert.ok( 1, 'init' );
            },
            onDestroy: function() {
                assert.ok( 1, 'destroy' );
            },
            onCoverImage: function() {
                if ( ! coverOnce ) {
                    assert.ok( 1, 'cover' );
                    coverOnce = 1;
                }
            },
        } );
        jarallax( $jarallax, 'destroy' );
    } );
} );
