QUnit.module('<img> tag', function () {
    QUnit.test('init', function (assert) {
        assert.expect(1);

        var $jarallax = $(UTILS.selector);
        UTILS.insertImage($jarallax, UTILS.image);
        var $image = $jarallax.find('img[src="' + UTILS.image + '"]')[0];

        $jarallax = $jarallax[0];
        jarallax($jarallax);

        var constructor = $jarallax.jarallax;

        assert.equal(constructor.image.$item, $image);
    });
});
