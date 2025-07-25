# BasinScout Craft CMS Integration

This package contains all necessary files to integrate the BasinScout interactive experience into your Craft CMS project.

## Installation

### 1. Copy Files

Copy the contents of this directory to your Craft CMS project:

```bash
# Copy templates
cp templates/* /path/to/craft/templates/

# Copy assets
cp -r web/assets/* /path/to/craft/web/assets/

# Copy migration
cp migrations/* /path/to/craft/migrations/
```

### 2. Run Migration

Execute the migration to create the required fields:

```bash
./craft migrate/up
```

This will create:

- **BasinScout** field group
- **Intro Title** - Plain text field for main heading
- **Intro Body** - Rich text field for introduction content
- **Intro Stats** - Matrix field for statistics with donut charts
- **Intro Background** - Asset field for background image
- **Panels** - Matrix field for interactive content panels
- **Results Title** - Plain text field for results section
- **Results Body** - Rich text field for results content
- **Results Background** - Asset field for results background

### 3. Create Entry Type

1. Go to **Settings → Sections** in your Craft control panel
2. Create a new section called "BasinScout"
3. Add the BasinScout fields to the entry type field layout
4. Arrange fields in logical groups:
   - **Introduction**: Intro Title, Intro Body, Intro Stats, Intro Background
   - **Content**: Panels
   - **Results**: Results Title, Results Body, Results Background

### 4. Upload Assets

Upload your background images and map stage images to the appropriate asset volumes:

- Background images for intro and results sections
- Map stage images for each panel (9 stages total)

## Field Structure

### Intro Stats Matrix

Each stat entry contains:

- **Value** (Number, 0-100): The percentage value for the donut chart
- **Label** (Text): The statistic label (e.g., "Rivers", "Streams")
- **Description** (Text): Additional context for the statistic
- **Show Donut** (Lightswitch): Whether to display as a donut chart

### Panels Matrix

Each panel contains:

- **Title** (Text): Panel heading
- **Copy** (Rich Text): Panel content
- **Map Image** (Asset): Background map image for this stage

## Template Usage

The main template `basinscout.twig` is designed to work with the field structure. Key features:

- Responsive design with mobile and tablet support
- GSAP-powered smooth animations
- Touch and scroll navigation
- Animated statistics with donut charts
- Progressive image loading
- Accessibility features (ARIA labels, keyboard navigation)

### Template Variables

The template expects an entry with the BasinScout fields. Example usage:

```twig
{% extends "_layout" %}

{% block content %}
    {% include "basinscout" with { entry: entry } %}
{% endblock %}
```

### Customization

You can customize animations and behavior by modifying the JavaScript variables in the template:

```javascript
// Animation timings
const ANIMATION_DURATION = 1.2;
const STATS_ANIMATION_DURATION = 2.0;
const SCROLL_COOLDOWN = 1000;

// Navigation settings
const ENABLE_TOUCH_NAVIGATION = true;
const ENABLE_KEYBOARD_NAVIGATION = true;
```

## Asset Requirements

### Background Images

- **Format**: JPG or PNG
- **Resolution**: 1920x1080 minimum
- **Optimization**: Compress for web delivery

### Map Stage Images

- **Format**: JPG or PNG
- **Resolution**: 1200x800 minimum
- **Naming**: Use descriptive names (e.g., "stage-1-baseline.jpg")

## Browser Support

- **Desktop**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Android Chrome 88+
- **Tablets**: iPad Safari 14+, Android tablets with Chrome 88+

## Performance Notes

- Images are lazy-loaded for optimal performance
- GSAP animations are hardware-accelerated
- CSS is optimized for minimal reflows
- JavaScript is bundled and minified

## Accessibility Features

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion support
- Focus management

## Troubleshooting

### Common Issues

**Animations not working**

- Ensure GSAP library is loaded
- Check browser console for JavaScript errors
- Verify CSS classes are applied correctly

**Images not loading**

- Check asset volume permissions
- Verify image file paths in templates
- Ensure images are optimized for web

**Touch navigation issues**

- Test on actual devices (not browser dev tools)
- Check touch event handlers
- Verify viewport meta tag is present

### Debug Mode

Enable debug logging by adding this to your template:

```javascript
window.DEBUG = true;
```

## Support

For technical support or customization requests, please contact the development team.

---

**Generated**: July 25, 2025
**Craft CMS Version**: 4.x+ Compatible
**Node.js Version**: 18+ Required for development
**GSAP Version**: 3.13+
