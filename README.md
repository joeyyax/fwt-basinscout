# BasinScout Interactive Experience

A responsive web application for The Freshwater Trust's BasinScout featuring smooth scroll-driven navigation, animated statistics, and comprehensive Craft CMS integration. Built with modern web technologies and optimized for production deployment.

## Features

- **Modern Stack** - Built with Vite, GSAP, and Tailwind CSS
- **Cross-Platform Navigation** - Touch, mouse wheel, and keyboard support with intelligent cooldown
- **Animated Statistics** - Interactive counting animations with glass morphism design
- **Dynamic Content** - Responsive panel system with background images and overlays
- **Accessibility** - ARIA labels, keyboard navigation, reduced motion support, and screen reader compatibility
- **Craft CMS Ready** - Complete integration package with migrations and Twig templates
- **Performance Optimized** - Throttled events, efficient DOM queries, and minimal reflows
- **Testing Suite** - 64 unit tests and 85+ E2E tests across all major browsers

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Development server with background task
pnpm run Dev Server  # VS Code task
```

### Building & Export

```bash
# Build for production (outputs to ./dist/html/)
pnpm run build

# Export to Craft CMS (outputs to ./dist/craft-cms/)
pnpm run craft-export
```

**Build Outputs:**

- `pnpm run build` → `./dist/html/` - Standard HTML build for static hosting
- `pnpm run craft-export` → `./dist/craft-cms/` - Craft CMS integration package

### Testing

```bash
# Unit tests
pnpm test
pnpm run test:ui        # Visual test interface
pnpm run test:coverage  # Coverage report

# End-to-end tests
pnpm run test:e2e       # Cross-browser E2E tests
pnpm run test:e2e:ui    # Visual E2E interface
pnpm run test:all       # Run all tests
```

### Code Quality

```bash
# Linting
pnpm run lint           # Check ESLint rules
pnpm run lint:fix       # Fix auto-fixable issues
pnpm run lint:all       # Lint entire project

# Formatting
pnpm run format         # Format with Prettier
pnpm run format:check   # Check formatting
pnpm run check          # Format + lint check
```

## Architecture

### Project Structure

```
src/
├── scripts/
│   ├── main.js              # Application entry point
│   ├── constants.js         # Configuration and settings
│   ├── state.js             # Centralized state management
│   ├── navigation.js        # Navigation logic with cooldown
│   ├── pagination.js        # Panel management
│   ├── accessibility.js     # ARIA and keyboard support
│   ├── animations/          # GSAP animation controllers
│   │   ├── index.js         # Animation orchestration
│   │   ├── panels.js        # Panel transition animations
│   │   ├── stats.js         # Statistics counting animations
│   │   └── titles.js        # Title and text animations
│   ├── core/                # Core functionality
│   │   ├── app-initializer.js    # Application bootstrap
│   │   ├── event-handlers.js     # Event management
│   │   └── scroll-handler.js     # Scroll event processing
│   └── utils/               # Utility modules
│       ├── dom-utils.js          # DOM manipulation helpers
│       ├── logger.js             # Debug logging
│       ├── content-overflow-detector.js  # Layout detection
│       └── structure-validator.js        # HTML validation
├── styles/                  # Component-based CSS
│   ├── style.css           # Main stylesheet entry
│   ├── base.css            # Reset and base styles
│   ├── buttons.css         # Glass morphism button system
│   ├── content.css         # Panel content styling
│   ├── animations.css      # CSS animation definitions
│   ├── backgrounds.css     # Background image handling
│   ├── header.css          # Header component
│   ├── pagination.css      # Navigation controls
│   └── sections.css        # Section layout

test/                       # Comprehensive testing suite
├── unit/                   # Unit tests (Vitest)
│   ├── setup.js            # Test configuration
│   ├── utils.js            # Test utilities
│   └── *.test.js           # Individual test files
├── e2e/                    # End-to-end tests (Playwright)
│   └── *.spec.js           # Cross-browser test specifications
└── results/                # Test outputs and reports

craft-cms/                  # Craft CMS integration (version controlled)
├── migrations/
│   └── m241201_000000_create_basinscout_fields.php  # Source migration
└── scripts/
    └── export-to-craft.js  # Export automation script

dist/                       # Built files (not version controlled)
├── html/                   # Standard HTML build output
│   ├── index.html
│   └── assets/
└── craft-cms/              # Craft CMS export package
    ├── templates/
    ├── migrations/
    └── web/assets/
```

### Key Technologies

- **Vite 6.3.5** - Lightning-fast build tool and development server
- **GSAP 3.12+** - Professional animation library with timeline control
- **Tailwind CSS 4.1+** - Utility-first CSS with custom properties
- **Vitest** - Fast unit testing with comprehensive mocking
- **Playwright** - Cross-browser E2E testing (Chrome, Firefox, Safari, Mobile)
- **ESLint 9+** - Code quality and consistency enforcement
- **Prettier** - Automated code formatting

## Configuration

### Animation Settings

Customize timing in `src/scripts/constants.js`:

```javascript
export const ANIMATION = {
  PANEL_TRANSITION_DURATION: 1.2, // Panel slide transitions
  CONTENT_ENTER_DURATION: 0.6, // Content fade-in
  CONTENT_EXIT_DURATION: 0.4, // Content fade-out
  STATS_ANIMATION_DURATION: 2.0, // Statistics counting
  SCROLL_COOLDOWN: 1000, // Navigation throttling (ms)
  EASING: 'power2.inOut', // GSAP easing function
};
```

### Navigation Settings

Configure scroll behavior:

```javascript
export const NAVIGATION = {
  ENABLE_SCROLL: true, // Mouse wheel navigation
  ENABLE_TOUCH: true, // Touch swipe navigation
  ENABLE_KEYBOARD: true, // Arrow key navigation
  SHOW_PROGRESS: true, // Progress indicators
  LOOP_NAVIGATION: false, // Return to start after last panel
};
```

### Content Structure

HTML structure for panels:

```html
<section class="section" data-background="stage-1.jpg">
  <div class="panels-container">
    <div class="panel" data-stats='[{"value": 50, "label": "Rivers"}]'>
      <div class="content">
        <h2 class="panel-title">Panel Title</h2>
        <div class="panel-content">
          <p>
            Panel content with
            <span class="stats-trigger">interactive stats</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Craft CMS Integration

### Export Process

The `pnpm run craft-export` command creates a complete Craft CMS integration package:

```bash
dist/craft-cms/
├── templates/
│   └── basinscout.twig     # Main Twig template
├── migrations/
│   └── m*_basinscout_fields.php  # Field creation migration
├── web/
│   └── assets/             # Built CSS/JS assets
└── README.md               # Integration instructions
```

### Craft CMS Fields

The migration creates these field types:

- **Page Title** - PlainText for main heading
- **Header Logo** - Assets field for SVG logo
- **Introduction Text** - Redactor for intro content
- **Basin Scout Panels** - Matrix field with:
  - Panel Title (PlainText)
  - Panel Content (Redactor)
  - Background Image (Assets)
  - Stats Data (Table)
  - Animation Settings (Lightswitch)
  - Panel Order (PlainText)
  - Map Stage (PlainText)
- **Navigation Settings** - Checkboxes for behavior config
- **Animation Settings** - Table for GSAP timing
- **SEO Fields** - Meta description and Open Graph image

### Template Integration

The generated Twig template includes:

```twig
{# Dynamic panel generation from Matrix field #}
{% for panel in entry.basinScoutPanels.all() %}
  <section class="section" data-background="{{ panel.backgroundImage.one().url ?? '' }}">
    <div class="panels-container">
      <div class="panel" data-stats="{{ panel.statsData | json_encode }}">
        <div class="content">
          <h2 class="panel-title">{{ panel.panelTitle }}</h2>
          <div class="panel-content">{{ panel.panelContent }}</div>
        </div>
      </div>
    </div>
  </section>
{% endfor %}
```

### Deployment Steps

1. **Copy Files**: Move `dist/craft-cms/` contents to your Craft project
2. **Run Migration**: Execute the field creation migration
3. **Create Content**: Use the new fields to build your content
4. **Test**: Verify functionality and animations work correctly

## Testing Strategy

### Unit Testing (64 tests)

**Test Coverage by Category:**

- **Error Handling** (12 tests) - Error detection and recovery mechanisms
- **Logger System** (15 tests) - Debug logging and event tracking
- **Navigation Logic** (8 tests) - User navigation with throttling/cooldown
- **Animation Controllers** (4 tests) - Statistics and visual animations
- **Event Management** (7 tests) - Scroll controllers and event handling
- **Content Systems** (11 tests) - Titles, overflow detection, and layout
- **Utility Functions** (7 tests) - DOM manipulation and helper utilities

```bash
# Run specific test suites
pnpm test error-handler     # Error handling tests
pnpm test navigation        # Navigation logic tests
pnpm test animations        # Animation controller tests
pnpm test scroll-controller # Event handling tests
```

**Key Testing Features:**

- **GSAP Mocking** - Comprehensive animation library mocking
- **State Management** - Application state and navigation logic validation
- **DOM Interactions** - Event handling and element manipulation verification
- **Component Integration** - Individual controller functionality testing

### E2E Testing (85+ tests)

- **Cross-Browser** - Chrome, Firefox, Safari, Mobile Chrome/Safari
- **Responsive Design** - Desktop (1920×1080), Tablet (768×1024), Mobile (375×667)
- **Touch Support** - Platform-aware scrolling and gestures
- **Accessibility** - ARIA compliance and keyboard navigation
- **Performance** - Rapid navigation and error handling

```bash
# Run E2E tests by browser
pnpm run test:e2e -- --project=chromium
pnpm run test:e2e -- --project=firefox
pnpm run test:e2e -- --project=webkit
pnpm run test:e2e -- --project=mobile-chrome
```

### Testing Best Practices

- **Mock Setup** - Use `vi.mock()` before imports for proper hoisting
- **State Initialization** - Call `appState.initDOM()` in test setup
- **Cross-Platform** - Test touch events only on actual mobile devices
- **Performance** - Use throttled events and efficient DOM queries

## Performance Optimizations

### Animation Performance

- **GSAP Timeline Control** - Efficient animation sequencing
- **Transform-Based Animations** - Hardware-accelerated transitions
- **Reduced Motion Support** - Respects user accessibility preferences
- **Animation Cooldowns** - Prevents rapid-fire navigation issues

### DOM Efficiency

- **Throttled Events** - Scroll and resize event limiting
- **Efficient Queries** - Cached DOM element references
- **Minimal Reflows** - Transform and opacity-based animations
- **Lazy Loading** - Progressive content and image loading

### Bundle Optimization

- **Modern JavaScript** - ES6+ features with broad browser support
- **Tree Shaking** - Unused code elimination
- **CSS Purging** - Tailwind's automatic unused class removal
- **Asset Compression** - Gzip compression in production builds

## Browser Support

### Supported Browsers

- **Desktop**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Android Chrome 88+
- **Tablets**: iPad Safari 14+, Android tablets with Chrome 88+

### Feature Detection

The application includes progressive enhancement:

- **GSAP Animations** - Graceful fallback for unsupported features
- **Touch Events** - Platform-aware interaction handling
- **CSS Grid/Flexbox** - Modern layout with fallbacks
- **Intersection Observer** - Polyfill for older browsers

## Development Guidelines

### Code Standards

- **ESLint Compliance** - Follow configured rules strictly
- **Prettier Formatting** - Automated code formatting
- **Component Architecture** - Single responsibility principle
- **CSS Organization** - Component-based stylesheets
- **Semantic HTML** - Proper heading hierarchy and landmarks

### Git Workflow

- **Feature Branches** - Isolated development
- **Pre-commit Hooks** - Automated testing and linting
- **Conventional Commits** - Semantic commit messages
- **Pull Request Reviews** - Code quality assurance

### Performance Monitoring

- **Bundle Analysis** - Regular size monitoring
- **Lighthouse Audits** - Performance and accessibility testing
- **Core Web Vitals** - Loading, interactivity, and visual stability
- **Cross-Device Testing** - Regular mobile and tablet verification

## Troubleshooting

### Common Issues

**Scroll Navigation Not Working**

- Check cooldown period in `NAVIGATION.SCROLL_COOLDOWN`
- Verify DOM structure matches expected selectors
- Ensure GSAP is properly loaded

**Animations Not Playing**

- Confirm GSAP timeline setup in animation controllers
- Check for JavaScript errors in browser console
- Verify CSS classes are applied correctly

**Touch Navigation Issues**

- Test on actual devices, not browser dev tools
- Check touch event prevention logic
- Verify platform detection is working

**Build Errors**

- Run `pnpm run lint:fix` to resolve code quality issues
- Check for missing dependencies with `pnpm install`
- Verify all imports use correct relative paths

### Debug Mode

Enable debug logging:

```javascript
// In browser console
window.DEBUG = true;
```

### Performance Profiling

Use browser dev tools:

1. **Performance Tab** - Analyze runtime performance
2. **Network Tab** - Monitor asset loading
3. **Lighthouse** - Comprehensive auditing
4. **Console** - Check for JavaScript errors

## License

Proprietary software developed for The Freshwater Trust.

---

**Project Status**: ✅ Production Ready
**Last Updated**: December 2024
**Craft CMS Version**: 4.x+ Compatible
**Node Version**: 18+ Required
