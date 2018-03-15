const jarallax = require('./src/jarallax.esm').default;
const jarallaxVideo = require('./src/jarallax-video.esm').default;
const jarallaxElement = require('./src/jarallax-element.esm').default;

module.exports = {
    jarallax,
    jarallaxElement() {
        return jarallaxElement(jarallax);
    },
    jarallaxVideo() {
        return jarallaxVideo(jarallax);
    },
};
