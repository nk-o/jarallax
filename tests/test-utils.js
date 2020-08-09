window.UTILS = {
    selector: '.jarallax',
    image: 'https://via.placeholder.com/100x50',
    insertImage: function( $where, image ) {
        return $where.append( '<img class="jarallax-img" src="' + image + '" alt="">' );
    },
    insertBackground: function( $where, image ) {
        return $where.css( 'background-image', 'url("' + image + '")' );
    },
    getBlock: function() {
        return $( UTILS.selector );
    },
    get: function( type ) {
        type = type || 'background';

        var method = 'insertImage';

        if ( 'background' === type ) {
            method = 'insertBackground';
        }

        return UTILS[ method ]( UTILS.getBlock(), UTILS.image );
    },
};
