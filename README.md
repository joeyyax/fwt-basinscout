# The Freshwater Trust BasinScout

A responsive web application for The Freshwater Trust's BasinScout featuring smooth scroll-driven navigation, animated statistics, and comprehensive Craft CMS integration.

## Features

- **Modern Stack** - Preact, Vite, GSAP, and Tailwind CSS
- **Cross-Platform Navigation** - Touch, mouse wheel, and keyboard support
- **Animated Statistics** - Interactive counting animations with donut charts
- **Dynamic Content** - Responsive panel system with background images
- **Accessibility** - ARIA labels, keyboard navigation, and reduced motion support
- **Craft CMS Integration** - Complete field structure and template system with GraphQL API
- **Performance Optimized** - Throttled events and efficient DOM queries
- **Comprehensive Testing** - Unit tests and cross-browser E2E testing

## Quick Start

### Development Setup

**1. Install dependencies**

```bash
pnpm install
```

**2. Environment Configuration**

Create a `.env` file in the project root for local development. Use `.env.example` as a template.

**3. Start development server**

```bash
# Basic development
pnpm run dev

# Development with debugging
DEBUG=true pnpm run dev
```

### Building & Production

```bash
# Build for production
pnpm run build

# Preview production build locally
pnpm run preview
```

### Testing

```bash
# Unit tests
pnpm test

# End-to-end tests
pnpm run test:e2e

# All tests
pnpm run test:all
```

### Code Quality

```bash
# Linting and formatting
pnpm run lint:fix
pnpm run format
```

## Configuration

Customize animation timing and navigation behavior in `src/scripts/constants.js`.

## Deployment Options

This application can be deployed in two ways:

**Standalone Deployment**

- Self-contained web application
- **Content Options**:
  - Uses static content from `src/data/content.js` (default)
  - Can consume content from any GraphQL API endpoint
- Deploy directly to any web hosting platform (Railway, Netlify, Vercel, etc.)
- No CMS dependencies - runs fully headless

**Craft CMS Integration**

- Full CMS integration with dynamic content management
- Uses GraphQL API for content delivery
- Requires Craft CMS backend with field structure and migrations
- See [craft-cms/README.md](./craft-cms/README.md) for complete setup

> ⚠️ **IMPORTANT**: This project exports to CraftCMS. Do not edit files directly in the `dist/craft-cms/` directory as they will be overwritten. See `./craft-cms/README.md` for complete integration documentation.

## Troubleshooting

### Common Issues

**Scroll Navigation Not Working**

- Check cooldown period in `ANIMATION.SCROLL_COOLDOWN`
- Verify DOM structure matches expected selectors
- Check browser console for JavaScript errors

**Animations Not Playing**

- Confirm GSAP timeline setup in animation controllers
- Check for JavaScript errors in browser console
- Test with reduced motion preference

**Build Errors**

- Run `pnpm run lint:fix` to resolve code quality issues
- Clear and reinstall dependencies: `rm -rf node_modules && pnpm install`

### Debug Mode

Enable debug logging:

```javascript
// In browser console
window.DEBUG = true;

// Or during development
DEBUG=true pnpm run dev
```

**Debug Features:**

- Navigation event logging
- Animation timeline tracking
- Scroll event monitoring
- State change visualization
- Performance metrics

### Performance Profiling

Use browser dev tools:

1. **Performance Tab** - Analyze runtime performance
2. **Network Tab** - Monitor asset loading
3. **Lighthouse** - Comprehensive auditing
4. **Console** - Check for JavaScript errors
