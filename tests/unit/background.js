QUnit.module('background-image style', function () {
    QUnit.test('init', function (assert) {
        assert.expect(1);

        var $jarallax = $(UTILS.selector);
        UTILS.insertBackground($jarallax, UTILS.image);
        $jarallax = $jarallax[0];
        jarallax($jarallax);

        var constructor = $jarallax.jarallax;

        assert.equal(constructor.image.src, UTILS.image);
    });
});
