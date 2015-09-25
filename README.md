# Just Another Parallax
jQuery background parallax plugin. High performance (translate3d) with fallback (background-position) for old browsers.

## Getting Started
Load jQuery(1.7+) and include Jarallax plugin
```html
<!-- Jarallax -->
<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'></script>
<script src='jarallax/jarallax.js'></script>
```

## Set up your HTML
Mandatory requirement for plugin works properly - the selected item should be NOT position: static (for ex. relative).
```html
<div class='jarallax' style='background-image: url(<background_image_url_here>)'>
  Your content here...
</div>
```
### Additional styles
This need for correct show background image before Jarallax initialize end.
```css
.jarallax {
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

# License
Copyright (c) 2015 _nK Licensed under the WTFPL license.
