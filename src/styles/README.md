# Styles Directory

This directory contains all CSS files organized following Tailwind CSS v4 best practices with native container queries and modern CSS nesting.

## File Structure

```
src/styles/
├── style.css       # Main entry point with Tailwind v4 import
├── base.css        # Base styles, resets, and global foundations
├── layout.css      # Layout components with native container queries
├── typography.css  # Typography with Tailwind v4 responsive design
├── components.css  # Interactive UI components with container queries
└── animations.css  # Animation utilities and performance optimizations
```

## Tailwind CSS v4 Implementation

### **Native Plugin System**

Tailwind CSS v4 uses a simplified import system without JavaScript plugins:

```css
/* Main stylesheet approach */
@import 'tailwindcss';

/* Custom component imports */
@import './base.css';
@import './layout.css';
@import './typography.css';
@import './components.css';
@import './animations.css';
```

### **Built-in Container Queries**

Tailwind v4 has native support for container queries without additional plugins:

```css
/* Typography scales based on container size */
.prose {
  h3 {
    font-size: 2rem;

    @container (min-width: 400px) {
      font-size: 2.25rem;
    }

    @container (min-width: 768px) {
      font-size: 2.5rem;
    }
  }
}

/* Section layout adapts to container */
.section {
  container-type: inline-size;
  padding: 2rem;

  @container (min-width: 480px) {
    padding: 2.5rem;
  }

  @container (min-width: 768px) {
    padding: 3rem;
  }

  @container (min-width: 1024px) {
    padding: 4rem;
  }
}

/* Responsive title sizing */
.title-wrapper h1 {
  font-size: 5rem;

  @container (min-width: 768px) {
    font-size: 6rem;
  }

  @container (min-width: 1024px) {
    font-size: 7rem;
  }
}
```

## CSS Nesting Architecture

All stylesheets use modern CSS nesting syntax for improved readability and organization:

### **typography.css**

```css
.title-wrapper {
  h1 {
    /* styles */
  }
}

.prose {
  color: white;

  h3,
  p {
    will-change: transform, opacity;
    opacity: 0;
  }

  h3 {
    /* heading styles */
  }

  p {
    /* paragraph styles */

    &:last-child {
      margin-bottom: 0;
    }
  }
}
```

### **components.css**

```css
.nav-dot {
  transition: all 0.3s ease;

  &:hover {
    /* hover styles */
  }
  &.active {
    /* active styles */
  }
}
```

### **animations.css**

```css
.section {
  contain: layout style paint;
}

.title-wrapper {
  h1 {
    will-change: transform, opacity;
    transform: translateZ(0); /* Hardware acceleration */
  }
}

.prose {
  h3,
  p {
    will-change: transform, opacity;
  }
}
```

## Benefits of CSS Nesting

### **Improved Readability**

- Related styles are grouped together logically
- Reduces visual clutter and repetition
- Easier to understand component structure at a glance

### **Better Organization**

- Parent-child relationships are visually clear
- Pseudo-selectors (`&:hover`, `&:active`) are inline with their base styles
- Media queries can be nested within components

### **Maintainability**

- Changes to a component are contained within its block
- Less chance of CSS specificity conflicts
- Easier to refactor and move component styles

### **Modern CSS Standards**

- Uses native CSS nesting (supported in modern browsers)
- No preprocessing required - works directly with PostCSS
- Follows current CSS best practices

## Import Order

The stylesheets are imported in the following order in `style.css`:

1. **CSS @import directives** - All modular stylesheets must be imported first
2. **Tailwind CSS directives** (`@tailwind base/components/utilities`) - After all imports
3. **Import sequence**:
   - `base.css` - Resets, global styles, foundational elements
   - `layout.css` - Containers, grids, positioning systems
   - `typography.css` - Text styles, headings, prose content
   - `components.css` - Interactive elements, navigation, UI components
   - `animations.css` - Performance optimizations for GSAP animations

**Important**: CSS `@import` statements must precede all other CSS rules including Tailwind directives to avoid PostCSS compilation errors.

## Architecture Principles

### 1. **Separation of Concerns**

Each file has a specific responsibility:

- `base.css` - Foundation layer (resets, global styles)
- `layout.css` - Structural components (containers, grids)
- `typography.css` - Text presentation
- `components.css` - Interactive elements
- `animations.css` - Animation performance

### 2. **Tailwind-First Approach**

- Use Tailwind utilities for most styling needs
- Custom CSS only for complex layouts or GSAP animations
- Component classes for reusable patterns

### 3. **Performance Optimization**

- Hardware acceleration for animated elements
- `will-change` properties for smooth animations
- Container queries for layout stability
- FOUC prevention for animated content

### 4. **Maintainability**

- Clear file organization by concern
- Comprehensive documentation
- Consistent naming conventions
- Modular import system

### 5. **CSS Nesting Best Practices**

- Keep nesting depth reasonable (max 3-4 levels)
- Use `&` for pseudo-selectors (`:hover`, `:active`, `:focus`)
- Group related nested elements logically
- Maintain consistent indentation for readability

## CSS Nesting Guidelines

### **Do's**

```css
/* ✅ Good: Logical grouping with reasonable nesting */
.nav-dot {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }

  &.active {
    background-color: white;
  }
}

/* ✅ Good: Related child elements nested */
.prose {
  color: white;

  h3,
  p {
    will-change: transform, opacity;
    opacity: 0;
  }

  p {
    font-size: 1.125rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
```

### **Don'ts**

```css
/* ❌ Avoid: Excessive nesting depth */
.section {
  .container {
    .content-wrapper {
      .panels-container {
        .panel {
          /* Too deep - hard to read */
        }
      }
    }
  }
}

/* ❌ Avoid: Nesting unrelated elements */
.title-wrapper {
  h1 {
    /* styles */
  }

  .nav-dot {
    /* Unrelated - should be separate */
  }
}
```

## Usage Guidelines

### Adding New Styles

1. **Utilities** - Use Tailwind classes in HTML when possible
2. **Components** - Add reusable component styles to `components.css` with nesting
3. **Layout patterns** - Add new layout systems to `layout.css`
4. **Animations** - Add performance optimizations to `animations.css`

### File Modification Rules

- **base.css** - Only modify for global resets or foundation changes
- **layout.css** - Add new layout components, don't modify existing
- **typography.css** - Add new text styles, maintain prose consistency
- **components.css** - Add interactive elements, maintain component patterns
- **animations.css** - Add performance optimizations for new animated elements

## Integration with GSAP

The animation system is optimized for GSAP performance:

- `will-change` properties on animated elements
- Hardware acceleration via `translateZ(0)`
- Layout containment for animation stability
- Opacity-based FOUC prevention

## Tailwind CSS Integration

This structure complements Tailwind CSS by:

- Following the cascade order (base → components → utilities)
- Using `@import` for modular organization
- Maintaining separation between utility and component styles
- Preserving Tailwind's utility-first philosophy
