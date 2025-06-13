# BasinScout Interactive Experience

A responsive web application for The Freshwater Trust's BasinScout. Features smooth animations, cross-platform navigation, and interactive data visualization.

## Features

- **Modern Stack** - Built with Vite, GSAP, and Tailwind CSS
- **Cross-Platform Navigation** - Touch, mouse wheel, and keyboard support
- **Animated Statistics** - Interactive donut charts and data visualization
- **Dynamic Media** - Responsive image loading with overlays
- **Accessibility** - ARIA labels, keyboard navigation, and reduced motion support
- **CMS Integration** - Data-driven content structure

## Development

### Setup

```bash
pnpm install
pnpm run dev
```

### Testing

```bash
pnpm test              # Unit tests
pnpm run test:e2e      # End-to-end tests
```

### Build

```bash
pnpm run build
```

## Architecture

### Structure

```
src/
├── scripts/
│   ├── main.js              # Application entry
│   ├── constants.js         # Configuration
│   ├── state.js             # State management
│   ├── navigation.js        # Navigation logic
│   ├── animations/          # Animation controllers
│   ├── core/                # Core functionality
│   └── utils/               # Utilities
└── styles/                  # CSS modules
```

### Technologies

- **Vite** - Build tool and development server
- **GSAP** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **Vitest** - Unit testing
- **Playwright** - End-to-end testing

## Configuration

### Animation Settings

Customize timing in `src/scripts/constants.js`:

```javascript
ANIMATION: {
  CONTENT_ENTER_DURATION: 0.6,
  CONTENT_EXIT_DURATION: 0.4,
  DONUT_ANIMATION_DURATION: 1.2
}
```

### Content Structure

Define sections using HTML data attributes:

```html
<section class="section" data-background="image.jpg">
  <div class="panels-container">
    <div class="panel">
      <!-- Content -->
    </div>
  </div>
</section>
```

## Testing

- **Unit Tests** - Core functionality and animation controllers
- **E2E Tests** - Cross-browser testing with accessibility validation
- **Performance Testing** - Touch interactions and responsive behavior

## License

Proprietary software developed for The Freshwater Trust.
