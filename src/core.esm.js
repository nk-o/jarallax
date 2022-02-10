import jarallaxLib from './core';
import jarallaxVideoExt from './ext-video';
import jarallaxElementExt from './deprecated/ext-element';

export const jarallax = jarallaxLib;

export const jarallaxVideo = function jarallaxVideo() {
  return jarallaxVideoExt(jarallax);
};

export const jarallaxElement = function jarallaxElement() {
  return jarallaxElementExt(jarallax);
};
