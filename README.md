# Vite + GSAP + Tailwind CSS v4.1 Scrolling Application

A cutting-edge, CMS-ready scrolling application featuring Tailwind CSS v4.1 with native container queries, GSAP animations, and modern CSS architecture.

## ✨ Features

- ⚡ **Vite** - Lightning fast build tool and dev server with hot reload
- 🎬 **GSAP** - Professional-grade animations with staggered content transitions
- 🎨 **Tailwind CSS v4.1.8** - Latest version with native container queries and modern CSS features
- 🏗️ **Modern CSS Architecture** - CSS nesting, custom properties, and performance optimizations
- 📦 **Native Container Queries** - Component-responsive design without plugin dependencies
- 🔄 **Dynamic Content** - CMS-friendly with automatic section/panel detection
- 📱 **Multi-Input Support** - Mouse wheel, touch, keyboard, and navigation dots
- 🎯 **Data-Driven Backgrounds** - HTML data attributes control section backgrounds
- ✨ **Advanced Title Animations** - Configurable fade-up and slide-right effects with staging
- 🚫 **FOUC Prevention** - CSS-based content hiding with optimized reveal animations
- 📐 **Fluid Typography** - CSS `clamp()` with container query enhancements
- 🎭 **Accessibility First** - Reduced motion and high contrast support
- 🐛 **Debug System** - Built-in validation and console utilities
- ✨ **Prettier** - Code formatting for consistent style

## 🎉 **Recent Improvements - Complete Architecture Refactor**

**✅ COMPLETED**: Major architecture refactor with component-based CSS & JavaScript structure

### **Phase 1: CSS Refactor ✅ Complete**

- **🎨 CSS Class-Based State Management** - Replaced all inline styles with semantic CSS classes
- **📁 Modular CSS Structure** - Separated components into dedicated CSS files
- **⚡ Performance Optimizations** - Hardware-accelerated animations with CSS-based transitions

### **Phase 2: JavaScript Refactor ✅ Complete**

- **🏗️ Component-Based Architecture** - Split monolithic AnimationController into focused components
- **🗺️ Interactive Map System Ready** - Dedicated MediaAnimationController for complex map features
- **🔄 100% Backward Compatible** - All existing code continues to work without changes
- **📊 Advanced Features Ready** - Stats overlays, drain dots, field selection, GIF controls

### **New Component Architecture:**

```
src/
├── scripts/
│   ├── animations.js         # ✅ Proxy for backward compatibility
│   ├── animations/          # 🆕 Component-based animation system
│   │   ├── index.js         # Main coordination layer
│   │   ├── sections.js      # Section transitions & backgrounds
│   │   ├── panels.js        # Panel content animations
│   │   ├── titles.js        # Title animation effects
│   │   └── media.js         # 🆕 Interactive map & media features
│   └── pagination.js        # 🆕 Dedicated pagination controller
├── styles/
│   ├── pagination.css       # 🆕 All pagination styles
│   ├── sections.css         # 🆕 Section component styles
│   ├── panels.css           # 🆕 Panel component styles
│   └── media-stack.css      # 🆕 Media stack styles
```

**📖 Documentation**:

- [REFACTOR_TESTING_COMPLETE.md](./REFACTOR_TESTING_COMPLETE.md) - CSS refactor details
- [JS_REFACTOR_COMPLETE.md](./JS_REFACTOR_COMPLETE.md) - JavaScript refactor details

## 🎨 Tailwind CSS v4.1 Enhancements

### Native Container Queries

- **No Plugin Dependencies** - Container queries work natively in v4.1
- **Multi-Dimensional Queries** - Both width and height-based responsive design
- **Performance Optimized** - Hardware-accelerated with CSS containment

### Modern CSS Features

- **CSS Nesting** - Clean, readable nested selectors throughout
- **Custom Properties** - Dynamic theming with CSS variables
- **Advanced Typography** - Fluid scaling with `clamp()` and container queries
- **Enhanced Performance** - GPU acceleration and optimized rendering

### Example Container Query Implementation:

```css
.prose {
  container-type: inline-size;

  h3 {
    font-size: clamp(1.5rem, 5vw, 2rem);

    @container (min-width: 400px) {
      font-size: theme('fontSize.prose-h3.0');
    }

    @container (min-width: 768px) {
      font-size: theme('fontSize.prose-h3-lg.0');
    }
  }
}
```

## 🚀 CMS Integration

This application is designed to work seamlessly with any CMS:

- **Dynamic Section Detection** - Automatically detects sections from HTML
- **Flexible Panel Count** - Each section can have different numbers of panels
- **HTML-Driven Backgrounds** - Set backgrounds via `data-background` attributes
- **No JavaScript Changes** - Add/remove content without touching code

See [CMS_INTEGRATION.md](./CMS_INTEGRATION.md) for detailed implementation guide.

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Architecture

### Organized File Structure

```
src/
├── scripts/              # JavaScript modules
│   ├── main.js          # Application entry point & initialization
│   ├── constants.js     # Configuration and constants
│   ├── state.js         # Centralized state management
│   ├── animations.js    # GSAP animations & title effects
│   ├── navigation.js    # Navigation logic
│   └── events.js        # Event handlers
└── styles/              # CSS architecture (Tailwind best practices)
    ├── style.css        # Main entry point
    ├── base.css         # Base styles and resets
    ├── layout.css       # Layout components
    ├── typography.css   # Text styles and prose
    ├── components.css   # Interactive UI elements
    └── animations.css   # Animation performance optimizations
```

### Enhanced CSS Architecture (Tailwind v4.1)

The styles leverage Tailwind CSS v4.1's advanced features with modern CSS:

- **🎯 Tailwind CSS v4.1.8** - Latest version with native container queries
- **📦 Zero Plugin Dependencies** - Container queries and typography work natively
- **🔄 Modern CSS Nesting** - Native CSS nesting for improved readability
- **📁 Modular Architecture** - Each CSS file handles specific responsibilities
- **⚡ Performance Optimized** - Hardware acceleration and CSS containment
- **🎨 Advanced Features** - CSS custom properties, fluid typography, multi-dimensional queries
- **📚 Comprehensive Documentation** - Detailed guides in `src/styles/README.md`

**Key v4.1 Improvements:**

- Native container queries without `@tailwindcss/container-queries` plugin
- Enhanced CSS nesting support
- Improved performance with CSS containment
- Advanced theming with CSS custom properties
- Multi-dimensional responsive design (width AND height queries)

**Example of Enhanced v4.1 Features:**

```css
/* Multi-dimensional container queries */
.content-wrapper {
  container-type: size; /* Both width and height */

  @container (min-width: 600px) {
    align-items: center;
  }

  @container (min-height: 400px) {
    justify-content: center;
  }

  /* Combined conditions */
  @container (min-width: 800px) and (min-height: 600px) {
    padding: var(--spacing-xl);
  }
}

/* CSS custom properties for dynamic theming */
.button {
  --button-bg: rgba(255, 255, 255, 0.1);
  --button-hover-bg: rgba(255, 255, 255, 0.2);

  background-color: var(--button-bg);
  transition: all 0.3s var(--ease-gsap);

  &:hover {
    background-color: var(--button-hover-bg);
  }
}
```

/_ FOUC prevention with nested selectors _/
h3,
p {
will-change: transform, opacity;
opacity: 0;
}
}

````

### Tailwind CSS v4 Benefits

- **🚀 Simplified Setup** - Single CSS import, no JavaScript plugin configuration
- **📦 Native Container Queries** - Built-in responsive components without additional packages
- **⚡ Better Performance** - Smaller bundle size, fewer dependencies
- **🔮 Future-Proof** - Latest CSS features with modern browser support
- **🛠️ Easier Maintenance** - No plugin compatibility issues or version conflicts

### Key Design Principles

- **Separation of Concerns** - Each module has a single responsibility
- **Dynamic Content Detection** - No hardcoded section/panel counts
- **Data-Driven Configuration** - HTML attributes control behavior
- **Performance Optimized** - Cached DOM queries and hardware acceleration
- **Modern CSS Standards** - Container queries and CSS nesting

## 🎬 Animation System

### Title Animations

Control section title animations with `data-title-animation` attribute:

- `data-title-animation="fade-up"` - Fade and slide up from bottom
- `data-title-animation="slide-right"` - Slide in from left

### Configurable Delays

- **Title Delay**: 200ms (configurable in `constants.js`)
- **Content Delay**: 800ms (configurable in `constants.js`)
- **Staged Animations**: Titles animate first, then content follows

### FOUC Prevention

- Content starts hidden (`opacity: 0`)
- Animations reveal content smoothly
- Element-specific opacity management

### Performance Features

- Hardware acceleration (`translateZ(0)`)
- `will-change` properties for smooth animations
- Container queries for layout stability

### Pagination System (CSS Class-Based)

**✨ New**: Completely refactored pagination system using CSS classes instead of inline styles:

- **🎨 CSS Classes Only** - No inline styles for better maintainability
- **🔧 Semantic Classes** - `.section-active`, `.panel-active`, etc.
- **⚡ Enhanced Performance** - CSS-based state transitions
- **🎯 Utility Classes** - Reusable hover and click feedback
- **📱 Responsive Design** - Both section and panel-level pagination
- **🔄 Legacy Support** - Backward compatibility maintained

**Class Structure:**
```css
.pagination-dot.section-active    /* Active section indicator */
.pagination-dot.panel-active      /* Active panel indicator */
.pagination-dot.hover-active      /* Enhanced hover effects */
.pagination-dot.click-feedback    /* Touch/click feedback */
```

See [PAGINATION_REFACTOR.md](./PAGINATION_REFACTOR.md) for implementation details.

## 📖 User Interactions

- **Mouse Wheel** - Scroll up/down to navigate between panels
- **Touch** - Swipe up/down on mobile devices
- **Keyboard** - Arrow keys for navigation
- **Navigation Dots** - Click to jump between sections
- **Auto-Progress** - Shows current panel position

### Build

Build for production:

```bash
npm run build
````

### Preview

Preview the production build:

```bash
npm run preview
```

### Code Formatting

Format code with Prettier:

```bash
npm run format
```

Check code formatting:

```bash
npm run format:check
```

## Project Structure

```
├── public/          # Static assets
├── src/
│   ├── main.js      # Application entry point & initialization
│   └── style.css    # Global styles with Tailwind directives
├── index.html       # HTML template
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── .prettierrc         # Prettier configuration
```

## 🐛 Debug & Development

### Debug Mode

Enable comprehensive debugging by setting `DEBUG_MODE = true` in `constants.js`:

- Console logging of structure and validation
- Detailed animation timing information
- DOM element validation checks

### Browser Console Utilities

Available global debugging functions:

- `CMS_DEBUG.logStructure()` - Log current section/panel structure
- `CMS_DEBUG.validateStructure()` - Validate DOM structure integrity
- `CMS_DEBUG.getCurrentState()` - Get current navigation state

### Auto-Generated Attributes

The system automatically adds missing data attributes:

- `data-section="0"` (section index)
- `data-panel="0"` (panel index within section)
- Console warnings for manual review when attributes are auto-generated

## Technologies

- **Vite**: Fast build tool optimized for modern web development
- **GSAP**: High-performance animation library for smooth, professional animations
- **Tailwind CSS**: Utility-first CSS framework with modular architecture
- **Prettier**: Opinionated code formatter for consistent styling

## Customization

### Configuration

- Edit `src/scripts/constants.js` to modify animation timings and debug settings
- Update `tailwind.config.js` to customize Tailwind theme
- Modify animation delays and easing in `src/scripts/animations.js`

### Styling

- Add new components to `src/styles/components.css`
- Extend typography in `src/styles/typography.css`
- Add layout patterns to `src/styles/layout.css`
- Update `src/style.css` for custom styles
- Configure `.prettierrc` for code formatting preferences
