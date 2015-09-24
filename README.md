## Just Another Parallax
jQuery background parallax plugin. High performance (translate3d) with fallback (background-position) for old browsers.

### 1. Getting Started
Load jQuery(1.7+) and include Jarallax plugin
```html
<!-- Jarallax -->
<script src="jarallax/jarallax.js"></script>
```

### 2. Set up your HTML
Mandatory requirement for plugin works properly - the selected item should be NOT position: static (for ex. relative).
```html
<div class="jarallax" style="background-image: url(<background_image_url_here>)">
  Your content here...
</div>
```
#### 2.1. Additional styles
This need for correct show background image before Jarallax initialize end.
```css
.jarallax {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}
```

### 3. Call the plugin
Now call the Jarallax initializer function and your parallax background is ready.
```html
$(".jarallax").jarallax();
```

## License
Copyright (c) 2015 _nK Licensed under the WTFPL license.
