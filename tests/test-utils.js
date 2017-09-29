window.UTILS = {
    selector: '.jarallax',
    image: 'https://via.placeholder.com/100x50',
    insertImage: function ($where, image) {
        return $where.append('<img class="jarallax-img" src="' + image + '" alt="">');
    },
    insertBackground: function ($where, image) {
        return $where.css('background-image', 'url("' + image + '")');
    },
    get: function (type) {
        type = type || 'background';

        if (type === 'background') {
            return UTILS.insertBackground($(UTILS.selector), UTILS.image);
        } else {
            return UTILS.insertImage($(UTILS.selector), UTILS.image);
        }
    },
};
