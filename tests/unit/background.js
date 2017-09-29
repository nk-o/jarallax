QUnit.module('background-image style', function () {
    QUnit.test('init', function (assert) {
        assert.expect(1);

        var $jarallax = UTILS.get('background')[0];
        jarallax($jarallax);

        var constructor = $jarallax.jarallax;

        assert.equal(constructor.image.src, UTILS.image);
    });
});
