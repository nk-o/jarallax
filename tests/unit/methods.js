QUnit.module( 'methods', function() {
    QUnit.test( 'css', function( assert ) {
        assert.expect( 3 );

        var $jarallax = UTILS.get( 'background' )[ 0 ];
        jarallax( $jarallax );

        var $testDiv = $( '<div>' ).appendTo( 'body' );
        $jarallax.jarallax.css( $testDiv[ 0 ], {
            transform: 'scale(1)',
            textAlign: 'right',
        } );

        assert.equal( $testDiv[ 0 ].style.textAlign, 'right', 'style added' );
        assert.equal( $testDiv[ 0 ].style.WebkitTransform, 'scale(1)', 'transform style with prefixes added' );
        assert.equal( $jarallax.jarallax.css( $testDiv[ 0 ], 'text-align' ), 'right', 'received style value' );

        $testDiv.remove();
    } );

    QUnit.test( 'extend', function( assert ) {
        assert.expect( 1 );

        var $jarallax = UTILS.get( 'background' )[ 0 ];
        jarallax( $jarallax );

        var data = $jarallax.jarallax.extend( {
            val1: 1,
            val2: 1,
            val3: 1,
        }, {
            val3: 2,
        }, {
            val4: 3,
        }, {
            val1: 4,
        } );
        assert.deepEqual( data, {
            val1: 4,
            val2: 1,
            val3: 2,
            val4: 3,
        }, 'extended 4 test objects' );
    } );

    QUnit.test( 'destroy', function( assert ) {
        assert.expect( 4 );

        var $jarallax = UTILS.get( 'background' )[ 0 ];

        jarallax( $jarallax );
        jarallax( $jarallax, 'destroy' );

        assert.equal( $jarallax.jarallax, undefined, 'removed jarallax instance from dom element' );
        assert.ok( $( $jarallax ).css( 'background-image' ) === 'url(' + UTILS.image + ')' || $( $jarallax ).css( 'background-image' ) === 'url("' + UTILS.image + '")', 'restored div with background image' );

        $( $jarallax ).removeAttr( 'style' );
        // eslint-disable-next-line prefer-destructuring
        $jarallax = UTILS.get( 'img' )[ 0 ];
        jarallax( $jarallax );
        jarallax( $jarallax, 'destroy' );
        assert.equal( $( $jarallax ).children( '.jarallax-img' ).attr( 'src' ), UTILS.image, 'restored div with <img> tag' );

        $( $jarallax ).css( {
            position: 'relative',
            zIndex: 10,
        } );
        jarallax( $jarallax );
        jarallax( $jarallax, 'destroy' );

        assert.equal( $( $jarallax ).attr( 'style' ), 'position: relative; z-index: 10;', 'restored div with additional styles' );
    } );

    QUnit.test( 'clipContainer', function( assert ) {
        assert.expect( 1 );

        var $jarallax = UTILS.get( 'background' )[ 0 ];
        jarallax( $jarallax );

        $( $jarallax ).css( {
            width: 122,
            height: 62,
        } );
        jarallax( $jarallax, 'clipContainer' );

        assert.equal( $( '#jarallax-clip-' + $jarallax.jarallax.instanceID ).html(), '#jarallax-container-' + $jarallax.jarallax.instanceID + ' {\n'
            + '           clip: rect(0 122px 62px 0);\n'
            + '           clip: rect(0, 122px, 62px, 0);\n'
            + '        }', 'added clip: rect() style' );

        $( $jarallax ).removeAttr( 'style' );
        jarallax( $jarallax, 'clipContainer' );
    } );

    QUnit.test( 'coverImage', function( assert ) {
        assert.expect( 3 );

        function getParallaxHeight( speed, contH ) {
            var scrollDist = 0;
            var resultH = contH;

            // scroll distance and height for image
            if ( 0 > speed ) {
                scrollDist = speed * Math.max( contH, window.innerHeight );
            } else {
                scrollDist = speed * ( contH + window.innerHeight );
            }

            // size for scroll parallax
            if ( 1 < speed ) {
                resultH = Math.abs( scrollDist - window.innerHeight );
            } else if ( 0 > speed ) {
                resultH = scrollDist / speed + Math.abs( scrollDist );
            } else {
                resultH += Math.abs( window.innerHeight - contH ) * ( 1 - speed );
            }

            return resultH;
        }

        var $jarallax = UTILS.get( 'img' )[ 0 ];

        jarallax( $jarallax, {
            speed: 0.85,
        } );
        var clientRect = $jarallax.getBoundingClientRect();
        var $img = $( $jarallax ).find( '> div > .jarallax-img' );
        var imgRect = $img[ 0 ].getBoundingClientRect();
        var $testDiv = $( '<div>' ).appendTo( 'body' ).css( 'height', getParallaxHeight( 0.85, clientRect.height ) );

        assert.equal( imgRect.height, $testDiv[ 0 ].getBoundingClientRect().height, 'height - ok' );
        assert.equal( imgRect.width, clientRect.width, 'width - ok' );
        assert.equal( imgRect.left, clientRect.left, 'left - ok' );

        $testDiv.remove();
    } );

    QUnit.test( 'isVisible', function( assert ) {
        assert.expect( 8 );

        var $jarallax = UTILS.get( 'background' )[ 0 ];
        jarallax( $jarallax );

        var clientRect = $jarallax.getBoundingClientRect();

        $( $jarallax ).css( 'margin-top', -( clientRect.top + clientRect.height ) );
        jarallax( $jarallax, 'onScroll' );
        assert.ok( jarallax( $jarallax, 'isVisible' ), 'on screen top - true' );
        $( $jarallax ).css( 'margin-top', '' );

        $( $jarallax ).css( 'margin-left', -( clientRect.left + clientRect.width ) );
        jarallax( $jarallax, 'onScroll' );
        assert.ok( jarallax( $jarallax, 'isVisible' ), 'on screen left - true' );
        $( $jarallax ).css( 'margin-left', '' );

        $( $jarallax ).css( 'margin-left', window.innerWidth - clientRect.left );
        jarallax( $jarallax, 'onScroll' );
        assert.ok( jarallax( $jarallax, 'isVisible' ), 'on screen right - true' );
        $( $jarallax ).css( 'margin-left', '' );

        $( $jarallax ).css( 'margin-top', window.innerHeight - clientRect.top );
        jarallax( $jarallax, 'onScroll' );
        assert.ok( jarallax( $jarallax, 'isVisible' ), 'on screen bottom - true' );
        $( $jarallax ).css( 'margin-top', '' );

        $( $jarallax ).css( 'margin-top', -( clientRect.top + clientRect.height + 1 ) );
        jarallax( $jarallax, 'onScroll' );
        assert.notOk( jarallax( $jarallax, 'isVisible' ), 'off screen top - false' );
        $( $jarallax ).css( 'margin-top', '' );

        $( $jarallax ).css( 'margin-left', -( clientRect.left + clientRect.width + 1 ) );
        jarallax( $jarallax, 'onScroll' );
        assert.notOk( jarallax( $jarallax, 'isVisible' ), 'off screen left - false' );
        $( $jarallax ).css( 'margin-left', '' );

        $( $jarallax ).css( 'margin-left', window.innerWidth - clientRect.left + 1 );
        jarallax( $jarallax, 'onScroll' );
        assert.notOk( jarallax( $jarallax, 'isVisible' ), 'off screen right - false' );
        $( $jarallax ).css( 'margin-left', '' );

        $( $jarallax ).css( 'margin-top', window.innerHeight - clientRect.top + 1 );
        jarallax( $jarallax, 'onScroll' );
        assert.notOk( jarallax( $jarallax, 'isVisible' ), 'off screen bottom - false' );
        $( $jarallax ).css( 'margin-top', '' );
    } );
} );
