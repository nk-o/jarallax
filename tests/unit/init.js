QUnit.module( 'init', function() {
    QUnit.test( 'init', function( assert ) {
        assert.expect( 2 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        jarallax( $jarallax );

        var constructor = $jarallax.jarallax;

        assert.ok( constructor, 'constructor saved' );
        assert.equal( constructor.$item, $jarallax, 'container saved' );
    } );

    QUnit.test( 'save current styles to attribute', function( assert ) {
        assert.expect( 2 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        jarallax( $jarallax );

        assert.notOk( $( $jarallax ).attr( 'data-jarallax-original-styles' ), 'prevent to add additional attribute if it is not needed' );

        jarallax( $jarallax, 'destroy' );
        $( $jarallax ).css( {
            position: 'relative',
            zIndex: 10,
        } );
        jarallax( $jarallax );

        assert.equal( $( $jarallax ).attr( 'data-jarallax-original-styles' ), 'position: relative; z-index: 10;', 'add additional attribute with style attribute data' );
    } );

    QUnit.test( 'change container position to relative if current static', function( assert ) {
        assert.expect( 1 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        $( $jarallax ).css( {
            position: 'static',
        } );
        jarallax( $jarallax );

        assert.equal( $( $jarallax ).css( 'position' ), 'relative' );
    } );

    QUnit.test( 'use absolute position if one of the parents have transform', function( assert ) {
        assert.expect( 1 );

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        $( 'body' ).css( 'transform', 'scale(1)' );
        jarallax( $jarallax );

        assert.equal( $( $jarallax ).find( '> div > .jarallax-img' ).css( 'position' ), 'absolute' );

        $( 'body' ).css( 'transform', '' );
    } );
} );
