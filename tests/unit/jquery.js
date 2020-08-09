QUnit.module( 'jquery', function() {
    QUnit.test( 'init', function( assert ) {
        assert.expect( 4 );

        assert.ok( $( document.body ).jarallax, 'jarallax method is defined' );

        var $jarallax = UTILS.get( 'img' );

        $jarallax.jarallax( {
            speed: 0.7,
        } );

        var constructor = $jarallax[ 0 ].jarallax;

        assert.equal( constructor.$item, $jarallax[ 0 ], 'inited' );
        assert.equal( constructor.options.speed, 0.7, 'options added' );

        $jarallax.jarallax( 'destroy' );

        assert.equal( $jarallax[ 0 ].jarallax, undefined, 'methods work' );
    } );
} );
