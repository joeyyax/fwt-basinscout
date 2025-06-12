<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Vite + GSAP + Tailwind Project → Craft CMS Integration

This is a modern web development project that will be **integrated into a Craft CMS project** after build completion:

- **Vite** for fast development and building
- **GSAP** for high-performance animations
- **Tailwind CSS** for utility-first styling
- **ESLint** for code quality and consistency
- **Vitest** for unit testing with comprehensive mocking
- **Playwright** for cross-browser E2E testing
- **Prettier** for code formatting
- **Craft CMS Ready** - Built assets will be merged into CMS

## Development Guidelines

- Use ES6+ JavaScript features
- Implement smooth GSAP animations for user interactions
- Follow Tailwind CSS utility-first approach for styling
- Maintain clean, readable code with Prettier formatting
- Use semantic HTML structure
- Optimize for performance and accessibility
- **Prepare for CMS integration** - Consider template structure and data binding
- **Modern Browser Support** - Target all modern browsers including tablet and mobile
- **Performance Focus** - Write performant code without specific bundle targets
- **Accessibility First** - Use ARIA attributes, semantic markup, and keyboard navigation

## Core Development Principles

### **Current Functionality Only**

- ❌ **NO assumptions** about future features (stats, markers, interactive elements)
- ✅ **Only implement** what currently exists in the HTML/CSS
- ✅ **Clean extension points** for organic growth when features are actually needed

### **Component-Based Architecture**

- ✅ **Modular CSS** - Separate files for components (`pagination.css`, `sections.css`, etc.)
- ✅ **Modular JavaScript** - Component-based animation controllers
- ✅ **Backward Compatibility** - All existing code must continue working

### **Development Workflow**

- ✅ **Check dev server** before starting new one (`curl -s http://localhost:5173/`)
- ✅ **Test changes** with `pnpm run build` before finalizing
- ✅ **Run tests** with `pnpm test` (unit) and `pnpm run test:e2e` (E2E) before commits
- ✅ **Fix ESLint issues** - Follow existing linting rules and patterns
- ✅ **Don't create summary/completion files** unless requested
- ✅ **Use pnpm package manager** - correct package manager for this project
- ✅ **Clean up temp files** regularly
- ✅ **Don't be overly verbose** - concise communication

### **Code Standards**

- ✅ **ESLint compliance** - Follow configured rules, no trailing spaces, proper imports
- ✅ **CSS classes over inline styles** - use semantic classes
- ✅ **Read existing files** before editing
- ✅ **Maintain existing patterns** and naming conventions
- ✅ **Component separation** - one responsibility per file
- ✅ **File naming** - follow existing structure and best practices
- ✅ **Asset organization** - reference existing `public/img/` structure

### **Accessibility Standards**

- ✅ **Semantic HTML** - Use proper heading hierarchy, landmarks, and form labels
- ✅ **ARIA attributes** - Add `aria-label`, `aria-describedby`, `role` where needed
- ✅ **Keyboard navigation** - Ensure all interactive elements are keyboard accessible
- ✅ **Focus management** - Visible focus indicators and logical tab order
- ✅ **Screen reader support** - Announce dynamic content changes
- ✅ **Reduced motion** - Respect `prefers-reduced-motion` setting

### **Testing Standards**

#### **Unit Testing (Vitest)**

- ✅ **Comprehensive coverage** - 34 unit tests covering all core functionality
- ✅ **GSAP mocking** - Use `vi.mock('gsap')` with proper hoisting before imports
- ✅ **State management** - Test appState initialization and navigation logic
- ✅ **Animation controllers** - Mock animations and test DOM interactions
- ✅ **Import paths** - Use correct `./scripts/` paths for src files
- ✅ **Mock patterns** - Follow established patterns in `src/test/setup.js`

#### **E2E Testing (Playwright)**

- ✅ **Cross-browser testing** - 85 E2E tests across Chrome, Firefox, Safari, Mobile
- ✅ **Responsive design** - Test desktop, tablet, and mobile viewports
- ✅ **Touch support** - Platform-aware scrolling (touch vs mouse wheel)
- ✅ **Accessibility validation** - ARIA labels, keyboard navigation, focus management
- ✅ **Performance testing** - Rapid navigation, error handling, image loading
- ✅ **Element visibility** - Use specific selectors (`header img[alt="..."]`) over broad ones

#### **Testing Best Practices**

- ✅ **Run unit tests** - `npm test` for fast feedback during development
- ✅ **Run E2E tests** - `npm run test:e2e` before major changes
- ✅ **Mock hoisting** - Use `vi.mock()` before imports in test files
- ✅ **DOM setup** - Use `appState.initDOM()` for proper test initialization
- ✅ **Cross-platform** - Test touch events only on actual mobile devices
- ✅ **Error handling** - Test edge cases and graceful degradation

### **Map System Development**

- ✅ **Data-driven approach** - Map features controlled by panel data attributes
- ✅ **9-stage system** - Will be implemented when HTML structure is ready
- ✅ **Current focus** - Basic scrolling and content animations only
- ✅ **Asset reference** - Use existing organized image structure in `public/img/`

### **Project Architecture Insights**

- ✅ **Event System** - Complex refactored navigation with throttling and state management
- ✅ **Animation Controllers** - Modular GSAP-based controllers for different content types
- ✅ **State Management** - Centralized appState with DOM initialization and navigation tracking
- ✅ **CSS Organization** - Component-based stylesheets with clear separation of concerns
- ✅ **Asset Structure** - Organized by map stages with numbered progression system
- ✅ **Mobile-First** - Touch-aware navigation with platform detection
- ✅ **Performance Optimized** - Throttled events, efficient DOM queries, and minimal reflows

## Key Technologies

- Vite serves the development environment with hot reload
- GSAP provides timeline-based animations and transitions
- Tailwind CSS offers responsive design utilities
- ESLint ensures code quality and consistency across the project
- Vitest provides fast unit testing with comprehensive mocking capabilities
- Playwright enables cross-browser E2E testing across desktop and mobile
- Prettier ensures consistent code formatting across the project

## Craft CMS Integration Notes

- **Build Output**: `pnpm run build` generates `dist/` folder for CMS integration
- **Asset Structure**: Built CSS/JS will be imported into Craft templates
- **Component-Based**: Current architecture supports CMS template integration
- **Data Attributes**: Use data attributes for CMS field binding
- **Performance**: Optimized bundle size for production deployment
