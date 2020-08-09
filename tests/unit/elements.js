QUnit.module( 'elements', function() {
    QUnit.test( 'calculate', function( assert ) {
        assert.expect( 1 );

        var $jarallax = UTILS.getBlock();

        $jarallax.jarallax( {
            type: 'element',
            speed: '120 -50',
        } );

        var wndH = window.innerHeight || document.documentElement.clientHeight;
        var wndY;

        if ( window.pageYOffset !== undefined ) {
            wndY = window.pageYOffset;
        } else {
            wndY = ( document.documentElement || document.body.parentNode || document.body ).scrollTop;
        }

        var saveStyle = $jarallax.attr( 'style' );
        $jarallax.attr( 'style', '' );
        var rect = $jarallax[ 0 ].getBoundingClientRect();
        var itemY = rect.top + wndY;
        var itemH = rect.height;
        $jarallax.attr( 'style', saveStyle );

        var centerPercent = ( wndY + wndH / 2 - itemY - itemH / 2 ) / ( wndH / 2 );
        var moveY = centerPercent * 120;
        var moveX = centerPercent * ( -50 );

        var $testDiv = $( '<div>' ).appendTo( 'body' );
        $jarallax[ 0 ].jarallax.css( $testDiv[ 0 ], {
            transform: 'translate3d(' + moveX + 'px,' + moveY + 'px,0)',
        } );

        assert.equal( $jarallax.attr( 'style' ), $testDiv.attr( 'style' ) );

        $testDiv.remove();
    } );

    QUnit.test( 'no background image', function( assert ) {
        assert.expect( 1 );

        var $jarallax = UTILS.getBlock();

        $jarallax.jarallax( {
            type: 'element',
            speed: '120 -50',
        } );

        assert.equal( 'none', $jarallax.find( '> div > div' ).css( 'background-image' ) );
    } );
} );
