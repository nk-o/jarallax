# Changelog

## [2.1.3] - Dec 17, 2022

- updated VideoWorker
- fixed wrong mute option provided to the VideoWorker

## [2.1.0] - Dec 16, 2022

- added IntersectionObserver to detect element in viewport (increased performance)
- added support for Youtube Shorts
- added support for Vimeo high quality thumbnails
- added `containerClass` and `videoClass` options
- updated TS typings
- updated demo site
- fixed Vimeo unmute when initial volume is 0
- fixed Vimeo volume value (used range from 0 to 1)
- split some core script functions to separate files
- removed unused methods `clipContainer`, `addToParallaxList`, `removeFromParallaxList`

## [2.0.4] - Jul 17, 2022

- removed `will-change` usage

## [2.0.2] - Feb 17, 2022

- added VideoWorker globally in video extension since some project uses it
- added browserslist-config-nk
- updated eslint and prettier configs

## [2.0.1] - Feb 10, 2022

- dropped IE support (supported modern browsers only)
- added ESM, UMD, and CJS modules
- added new event callbacks to video extension: `onVideoInsert`, `onVideoWorkerInit`
- added usage examples (<https://github.com/nk-o/jarallax/tree/master/examples>)
- added prettier for code formatting
- removed `clipContainer` method, use modern clip-path styles instead
- removed check for transform with vendor prefixes
- changed gulp+webpack to rollup (less bundle size)
- changed simple-git-hooks to husky

## [1.12.8] - Oct 20, 2021

- include TS typings in dist (#199)
- changed standard position for mobile devices to 'fixed' (working smoother)

## [1.12.7] - May 12, 2021

- removed postinstall script

## [1.12.6] - May 12, 2021

- added accessibility attributes to background videos (tabindex, aria-hidden)

## [1.12.5] - Nov 28, 2020

- added GDPR compliance parameters to Youtube and Vimeo API calls (in video-workers library)
- updated dependencies

## [1.12.4] - Sep 13, 2020

- additional styles for video elements (prevent click on video blocks)
- fixed video loop and image reset problem

## [1.12.3] - Sep 22, 2020

- fixed bug with clip images in Safari v14 (#181)

## [1.12.2] - Aug 9, 2020

- updated dependencies
- updated video-worker script (resolves #178)
- slightly changed styles, applied to container and to parallaxed images

## [1.12.1] - Apr 28, 2020

- DEPRECATED Elements extension for Jarallax. Use `lax.js` instead <https://github.com/alexfoxy/lax.js>
- added support for video error event (display image when error)
- added poster attribute for self-hosted videos
- fixed video background playing when disabled parallax only
- removed `rafl` dependency. Use native requestAnimationFrame instead

## [1.12.0] - Oct 22, 2019

- added support for scrollable parents
- removed resize observer support (should work without it)
