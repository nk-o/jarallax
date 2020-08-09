QUnit.module( 'background-image style', function() {
    QUnit.test( 'init', function( assert ) {
        assert.expect( 2 );

        var $jarallax = UTILS.get( 'background' )[ 0 ];
        jarallax( $jarallax );

        var constructor = $jarallax.jarallax;

        assert.equal( constructor.image.src, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' );
        assert.equal( constructor.image.bgImage, 'url("' + UTILS.image + '")' );
    } );
} );
