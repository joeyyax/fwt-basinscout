# BasinScout - Front-End Project Overview

## What This Project Is

BasinScout is an interactive web application that tells the story of water conservation through animated maps and data visualizations. Think of it as a digital presentation that users can navigate through by scrolling or clicking, with smooth animations and transitions between different sections.

## How It Works (Simple Version)

### The Big Picture

The website is like a slideshow with three main sections:

1. **Introduction** - Explains the water pollution problem with animated statistics
2. **Interactive Map** - Shows how BasinScout analyzes farm fields and water systems
3. **Results** - Demonstrates the impact of the conservation work

### User Experience

- Users scroll down or use navigation dots to move between sections
- Each section has its own background image that zooms and transforms
- Statistics animate as users reach them (like progress bars filling up)
- Maps reveal information step-by-step as users navigate through panels

## Technical Architecture (For Developers)

### Core Technologies

- **Vite** - Fast development server and build tool
- **GSAP** - Professional animation library for smooth transitions
- **Tailwind CSS** - Utility-first styling framework
- **Vanilla JavaScript** - No heavy frameworks, just clean modern JS

### Key Components

#### 1. **Navigation System**

- Detects scroll/swipe gestures and keyboard input
- Smooth transitions between sections and panels
- Navigation dots show current position
- Touch-friendly for mobile devices

#### 2. **Animation Engine**

- Background images that zoom and transform as users navigate
- Animated statistics (donut charts, counters)
- Staggered content animations for visual appeal
- Responsive to user actions with cooldown periods

#### 3. **State Management**

- Tracks current section and panel
- Manages animation states to prevent conflicts
- Handles navigation timing and cooldowns

#### 4. **Content Structure**

```
Section 1: Introduction
├── Panel 1: Problem statistics
└── Panel 2: Solution overview

Section 2: Interactive Map
├── Panel 1: Overview mapping
├── Panel 2: Field analysis
├── Panel 3: Irrigation upgrades
└── ...10 panels total

Section 3: Results
└── Panel 1: Impact summary
```

### File Organization

#### Scripts (`/src/scripts/`)

- **`main.js`** - Entry point, initialization, and application setup
- **`state.js`** - Tracks current position and navigation state
- **`navigation.js`** - Handles user input and section switching
- **`events.js`** - Manages scroll, touch, and keyboard events

#### Animations (`/src/scripts/animations/`)

- **`sections.js`** - Background image transitions
- **`panels.js`** - Content panel animations
- **`titles.js`** - Heading animations
- **`media-stack.js`** - Image transitions in map section
- **`panel-stats.js`** - Animated statistics and charts

#### Styles (`/src/styles/`)

- **`style.css`** - Main stylesheet importing all components
- **`base.css`** - Typography and basic layout
- **`sections.css`** - Section-specific styling
- **`panels.css`** - Content panel layouts
- **`pagination.css`** - Navigation dots styling

### Development Workflow

#### Running the Project

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run browser tests
```

#### Quality Assurance

- **ESLint** - Code quality and consistency
- **Prettier** - Automatic code formatting
- **Vitest** - 34 unit tests covering core functionality
- **Playwright** - 85 end-to-end tests across browsers
- **Lighthouse CI** - Performance and accessibility monitoring

### Browser Support

- **Modern browsers** - Chrome, Firefox, Safari, Edge
- **Mobile devices** - Touch-optimized navigation
- **Accessibility** - Keyboard navigation, screen readers, ARIA labels

## Content Management (CMS Integration Ready)

### Current Structure

The HTML content is structured with semantic markup and data attributes that make it easy to integrate with a Content Management System:

```html
<section data-background="/img/bg/image.jpg" data-title-animation="fade-up">
  <h1>Section Title</h1>
  <div class="panel" data-media="/img/map.png">
    <div class="prose">
      <p>Panel content goes here...</p>
    </div>
  </div>
</section>
```

### CMS-Friendly Features

- **Data-driven** - Background images, animations, and media controlled by HTML attributes
- **Flexible content** - Panels can contain any HTML content
- **Dynamic navigation** - Automatically adapts to the number of sections and panels
- **Asset organization** - Images organized by map stages for easy management

### Build Output

Running `npm run build` creates a `dist/` folder containing:

- Optimized CSS and JavaScript files
- Compressed images
- HTML file ready for CMS template integration

## Performance & Testing

### Automated Testing

- **Unit Tests** - Test individual components and functions
- **End-to-End Tests** - Simulate real user interactions across browsers
- **Performance Monitoring** - Lighthouse CI tracks loading speeds and accessibility
- **Cross-browser Testing** - Ensures compatibility across Chrome, Firefox, Safari

### Quality Standards

- **Performance** - Fast loading with optimized images and code
- **Accessibility** - WCAG compliant with keyboard navigation and screen reader support
- **Reliability** - Comprehensive error handling and graceful degradation
- **Responsive** - Works seamlessly on desktop, tablet, and mobile

## Future Development

The current codebase is designed for easy expansion:

- **Modular architecture** - New animation types can be added easily
- **Component-based** - Each section/panel type is independently managed
- **Data-driven** - New content can be added through HTML/CMS without code changes
- **Performance optimized** - Built for fast loading and smooth animations

This foundation supports organic growth as new features are needed, while maintaining the clean, professional user experience that showcases The Freshwater Trust's important conservation work.
