import { registerComponent } from '../utils/components.js';

/**
 * Section Navigation Component
 *
 * Renders the pagination navigation between sections.
 * This gets populated dynamically by the navigation script.
 */
export function SectionNavigation() {
  return (
    <nav
      className="pagination pagination-section"
      aria-label="Section navigation"
      role="navigation"
    >
      {/* Navigation items are populated dynamically by scripts/navigation.js */}
    </nav>
  );
}

// Register component for CMS export
registerComponent('SectionNavigation', SectionNavigation, {
  name: 'Section Navigation',
  description: 'Navigation between page sections',
  fields: {
    // This component is populated dynamically, so no CMS fields needed
  },
});
