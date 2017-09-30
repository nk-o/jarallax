# Just Another Parallax
Smooth parallax scrolling effect for background images, videos and inline elements. Code in pure JavaScript with ***NO dependencies*** + jQuery supported. ***Youtube***, ***Vimeo*** and ***Local Videos*** parallax supported.

## [Demo](https://free.nkdev.info/jarallax/)

## Tested Browsers
* IE9+
* Safari 5.1.7+
* Opera 12+
* Latest browsers on Mac and Windows (Chrome, Firefox, Safari, IE, Edge)
* Latest Chrome on Android
* Latest Safari on iOs

## Want WordPress Plugin?

[![Advanced WordPress Backgrounds](https://a.nkdev.info/jarallax/awb-preview.jpg)](https://wordpress.org/plugins/advanced-backgrounds/)

We made WordPress plugin to easily make backgrounds for content in your blog with all Jarallax features.

Demo: https://wp.nkdev.info/free-advanced-wordpress-backgrounds/

Download: https://nkdev.info/downloads/advanced-wordpress-backgrounds/

## Install
Include Jarallax plugin. Also include jQuery before jarallax if you want to use it.

### Download
Download scripts directly from this repository and link it in your HTML file
```html
<!-- Jarallax -->
<script src="jarallax/jarallax.js"></script>

<!-- Include it if you want to use Video parallax -->
<script src="jarallax/jarallax-video.js"></script>

<!-- Include it if you want to parallax any element -->
<script src="jarallax/jarallax-element.js"></script>
```

### CDN
Link directly from [cdnjs](https://cdnjs.com/)
```html
<!-- Jarallax -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jarallax/1.9.0/jarallax.min.js"></script>

<!-- Include it if you want to use Video parallax -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jarallax/1.9.0/jarallax-video.min.js"></script>

<!-- Include it if you want to parallax any element -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jarallax/1.9.0/jarallax-element.min.js"></script>
```

### Package managers
npm: `npm install jarallax -- save`

Bower: `bower install jarallax --save`

## Supported plugins
You can add these plugins before jarallax initialize.
- [object-fit-images](https://github.com/bfred-it/object-fit-images) polyfill for `object-fit` styles;
- [lazysizes](https://github.com/aFarkas/lazysizes) lazy-load images with srcset support;

## Set up your HTML
```html
<!-- Background Image Parallax -->
<div class="jarallax">
    <img class="jarallax-img" src="<background_image_url_here>" alt="">
    Your content here...
</div>

<!-- Alternate: Background Image Parallax -->
<div class="jarallax" style="background-image: url('<background_image_url_here>');">
    Your content here...
</div>
```

### Additional styles
These styles need to correct background image position before Jarallax initialized:
```css
.jarallax {
    position: relative;
    z-index: 0;
}
.jarallax > .jarallax-img {
    position: absolute;
    object-fit: cover;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}
```

## Call the plugin

### A. Data attribute way
```html
<div data-jarallax data-speed="0.2" class="jarallax">
    <img class="jarallax-img" src="<background_image_url_here>" alt="">
    Your content here...
</div>
```

### B. JavaScript way
```javascript
jarallax(document.querySelectorAll('.jarallax'), {
    speed: 0.2
});
```

### C. jQuery way
```javascript
$('.jarallax').jarallax({
    speed: 0.2
});
```

## Background Video Usage Examples
```html
<!-- Background YouTube Parallax -->
<div class="jarallax" data-jarallax-video="https://www.youtube.com/watch?v=ab0TSkLe-E0">
    Your content here...
</div>

<!-- Background Vimeo Parallax -->
<div class="jarallax" data-jarallax-video="https://vimeo.com/110138539">
    Your content here...
</div>

<!-- Background Local Video Parallax -->
<div class="jarallax" data-jarallax-video="mp4:./video/local-video.mp4,webm:./video/local-video.webm,ogv:./video/local-video.ogv">
    Your content here...
</div>
```
Note: for local videos required only 1 video type, not necessary use all mp4, webm and ogv. This need only for maximum compatibility with all browsers.

## Any Element Parallax Usage Examples
```html
<!-- Element will be parallaxed on inverted 140 pixels from the screen center -->
<div data-jarallax-element="-140">
    Your content here...
</div>

<!-- Element will be parallaxed on 250 pixels from the screen center -->
<div data-jarallax-element="250">
    Your content here...
</div>
```
Note: this is more like experimental feature, so the behavior could be changed in the future releases.

# Options
Options can be passed in data attributes or in object when you initialize jarallax from script.

<table class='table table-bordered table-striped'>
    <thead>
        <tr>
            <th>name</th>
            <th>type</th>
            <th>default</th>
            <th style='width: 60%;'>description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>type</td>
            <td>string</td>
            <td>scroll</td>
            <td>scroll, scale, opacity, scroll-opacity, scale-opacity.</td>
        </tr>
        <tr>
            <td>speed</td>
            <td>float</td>
            <td>0.5</td>
            <td>Parallax effect speed. Provide numbers from -1.0 to 2.0.</td>
        </tr>
        <tr>
            <td>imgSrc</td>
            <td>path</td>
            <td>null</td>
            <td>Image url. By default used image from background.</td>
        </tr>
        <tr>
            <td>imgElement</td>
            <td>dom / selector</td>
            <td>.jarallax-img</td>
            <td>Image tag that will be used as background.</td>
        </tr>
        <tr>
            <td>imgSize</td>
            <td>string</td>
            <td>cover</td>
            <td>Image size. If you use <code>&lt;img></code> tag for background, you should add <code>object-fit</code> values, else use <code>background-size</code> values.</td>
        </tr>
        <tr>
            <td>imgPosition</td>
            <td>string</td>
            <td>50% 50%</td>
            <td>Image position. If you use <code>&lt;img></code> tag for background, you should add <code>object-position</code> values, else use <code>background-position</code> values.</td>
        </tr>
        <tr>
            <td>imgRepeat</td>
            <td>string</td>
            <td>no-repeat</td>
            <td>Image repeat. Supported only <code>background-position</code> values.</td>
        </tr>
        <tr>
            <td>keepImg</td>
            <td>boolean</td>
            <td>false</td>
            <td>Kepp <code>&lt;img></code> tag in it's default place after Jarallax inited.</td>
        </tr>
        <tr>
            <td>elementInViewport</td>
            <td>dom</td>
            <td>null</td>
            <td>Use custom DOM / jQuery element to check if parallax block in viewport. More info here - <a href="https://github.com/nk-o/jarallax/issues/13">Issue 13</a>.</td>
        </tr>
        <tr>
            <td>zIndex</td>
            <td>number</td>
            <td>-100</td>
            <td>z-index of parallax container.</td>
        </tr>
        <tr>
            <td>noAndroid</td>
            <td>boolean</td>
            <td>false</td>
            <td>Disable parallax on Android devices.</td>
        </tr>
        <tr>
            <td>noIos</td>
            <td>boolean</td>
            <td>false</td>
            <td>Disable parallax on iOs devices.</td>
        </tr>
    </tbody>
</table>

### Options For Video (+ supported all default options)
Required `jarallax/jarallax-video.js` file.

<table class='table table-bordered table-striped'>
    <thead>
        <tr>
            <th>name</th>
            <th>type</th>
            <th>default</th>
            <th style='width: 60%;'>description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>videoSrc</td>
            <td>string</td>
            <td>null</td>
            <td>You can use Youtube, Vimeo or local videos. Also you can use data attribute <code>data-jarallax-video</code>.</td>
        </tr>
        <tr>
            <td>videoStartTime</td>
            <td>float</td>
            <td>0</td>
            <td>Start time in seconds when video will be started (this value will be applied also after loop).</td>
        </tr>
        <tr>
            <td>videoEndTime</td>
            <td>float</td>
            <td>0</td>
            <td>End time in seconds when video will be ended.</td>
        </tr>
        <tr>
            <td>videoVolume</td>
            <td>float</td>
            <td>0</td>
            <td>Video volume from 0 to 100.</td>
        </tr>
        <tr>
            <td>videoPlayOnlyVisible</td>
            <td>boolean</td>
            <td>true</td>
            <td>Play video only when it is visible on the screen.</td>
        </tr>
    </tbody>
</table>

### Options For Element Parallax
Required `jarallax/jarallax-element.js` file.

<table class='table table-bordered table-striped'>
    <thead>
        <tr>
            <th>name</th>
            <th>type</th>
            <th>default</th>
            <th style='width: 60%;'>description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>type</td>
            <td>string</td>
            <td>element</td>
            <td>Will only work with <code>element</code> value.</td>
        </tr>
        <tr>
            <td>speed</td>
            <td>float</td>
            <td>0</td>
            <td>Parallax distance in pixels. Supported any value. Also you can use data attribute <code>data-jarallax-element</code>.</td>
        </tr>
    </tbody>
</table>

# Events
Evenets used the same way as Options.

<table class='table table-bordered table-striped'>
    <thead>
        <tr>
            <th>name</th>
            <th style='width: 60%;'>description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>onScroll</td>
            <td>Called when parallax working. Use first argument with calculations. More info <a href="#onscroll-event">see below</a>.
            </td>
        </tr>
        <tr>
            <td>onInit</td>
            <td>Called after init end.</td>
        </tr>
        <tr>
            <td>onDestroy</td>
            <td>Called after destroy.</td>
        </tr>
        <tr>
            <td>onCoverImage</td>
            <td>Called after cover image.</td>
        </tr>
    </tbody>
</table>

## onScroll event
```javascript
jarallax(document.querySelectorAll('.jarallax'), {
    onScroll: function(calculations) {
        console.log(calculations);
    }
});
```

Console Result:
```javascript
{
    // parallax section client rect (top, left, width, height)
    rect            : object,

    // see image below for more info
    beforeTop       : float,
    beforeTopEnd    : float,
    afterTop        : float,
    beforeBottom    : float,
    beforeBottomEnd : float,
    afterBottom     : float,

    // percent of visible part of section (from 0 to 1)
    visiblePercent  : float,

    // percent of block position relative to center of viewport from -1 to 1
    fromViewportCenter: float
}
```

Calculations example:
[![On Scroll Calculations](https://a.nkdev.info/jarallax/jarallax-calculations.jpg)](https://a.nkdev.info/jarallax/jarallax-calculations.jpg)


# Methods
<table class='table table-bordered table-striped'>
    <thead>
        <tr>
            <th>name</th>
            <th>result</th>
            <th style='width: 60%;'>description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>destroy</td>
            <td>-</td>
            <td>Destroy Jarallax and set block as it was before plugin init.</td>
        </tr>
        <tr>
            <td>isVisible</td>
            <td>boolean</td>
            <td>Check if parallax block is in viewport.</td>
        </tr>
        <tr>
            <td>onResize</td>
            <td>-</td>
            <td>Fit image and clip parallax container. Called on window resize and load.</td>
        </tr>
        <tr>
            <td>onScroll</td>
            <td>-</td>
            <td>Calculate parallax image position. Called on window scroll.</td>
        </tr>
    </tbody>
</table>

## Call methods example
### A. JavaScript way
```javascript
jarallax(document.querySelectorAll('.jarallax'), 'destroy');
```

### B. jQuery way
```javascript
$('.jarallax').jarallax('destroy');
```


# No conflict
If you already have global ***jarallax*** variable or ***jQuery.fn.jarallax***, you can rename plugin.
### A. JavaScript way
```javascript
var newJarallax = jarallax.noConflict();
```

### B. jQuery way
```javascript
jQuery.fn.newJarallax = jQuery.fn.jarallax.noConflict();
```


# Real Usage Examples
* [Khaki](https://demo.nkdev.info/#khaki)
* [Godlike](https://demo.nkdev.info/#godlike)
* [Youplay](https://demo.nkdev.info/#youplay)

# Credits
Images https://unsplash.com/
Local Video https://videos.pexels.com/

# License
Copyright (c) 2017 nK Licensed under the WTFPL license.
