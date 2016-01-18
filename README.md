# Just Another Parallax
jQuery background parallax plugin used for adding a smooth parallax scrolling effect to background images and Youtube/Vimeo videos using CSS3 transforms (translate3d). With a background-position fallback when CSS transforms are not supported.

## Tested Browsers
* IE9+
* Safari 5.1.7+
* Opera 12+
* Latest browsers on Mac and Windows (Chrome, Firefox, Safari, IE, Edge)
* Latest Chrome on Android
* Latest Safari on iOs

## Demos
* [Simple parallax](http://free.nkdev.info/jarallax/simple-parallax.html)
* [Parallax with smooth scroll](http://free.nkdev.info/jarallax/smooth-scroll.html)
* [Parallax with full-height blocks](http://free.nkdev.info/jarallax/full-height-blocks.html)
* [Parallax with Scale and Opacity](http://free.nkdev.info/jarallax/scale-opacity-parallax.html)
* [Video Parallax (Youtube and Vimeo)](http://free.nkdev.info/jarallax/video-parallax.html)

## Getting Started
Load jQuery(1.7+) and include Jarallax plugin
```html
<!-- Jarallax -->
<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'></script>
<script src='jarallax/jarallax.js'></script>

<!-- Include it if you want to use Video parallax -->
<script src='jarallax/jarallax-video.js'></script>
```

## Set up your HTML
Mandatory requirement for plugin works properly - the selected item should be NOT position: static (for ex. relative).
```html
<!-- Image Parallax -->
<div class='jarallax' style='background-image: url(<background_image_url_here>)'>
  Your content here...
</div>

<!-- Video Parallax -->
<div class='jarallax' data-jarallax-video='https://www.youtube.com/watch?v=ab0TSkLe-E0'>
  Your content here...
</div>
```
### Additional styles
This need for correct show background image before Jarallax initialize end.
```css
.jarallax {
  position: relative;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}
```

## Call the plugin
### A. Data attribute way
```html
<div data-jarallax='{"speed": 0.2}' class='jarallax' style='background-image: url(<background_image_url_here>)'>
  Your content here...
</div>
```
### B. JavaScript way
```javascript
$('.jarallax').jarallax({
    speed: 0.2
});
```

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
            <td>scroll, scale, opacity, scroll-opacity, scale-opacity</td>
        </tr>
        <tr>
            <td>speed</td>
            <td>float</td>
            <td>0.5</td>
            <td>Parallax effect speed. Provide numbers from 0.0 to 1.0</td>
        </tr>
        <tr>
            <td>imgSrc</td>
            <td>path</td>
            <td>null</td>
            <td>Image path. By default used image from background.</td>
        </tr>
        <tr>
            <td>imgWidth</td>
            <td>number</td>
            <td>null</td>
            <td rowspan='2'>You can provide the natural width and natural height of an image to speed up loading.</td>
        </tr>
        <tr>
            <td>imgHeight</td>
            <td>number</td>
            <td>null</td>
        </tr>
        <tr>
            <td>enableTransform</td>
            <td>boolean</td>
            <td>true</td>
            <td>Enable transformations for effect if supported. When option is false - used background-position instead.</td>
        </tr>
        <tr>
            <td>zIndex</td>
            <td>number</td>
            <td>-100</td>
            <td>z-index of parallax container.</td>
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
$('.jarallax').jarallax({
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
    visiblePercent  : float
}
```

Calculations example:
[![On Scroll Calculations](http://a.nkdev.info/jarallax/jarallax-calculations.jpg)](http://a.nkdev.info/jarallax/jarallax-calculations.jpg)

# Images
All demo images from https://www.pexels.com/

# License
Copyright (c) 2015 _nK Licensed under the WTFPL license.
