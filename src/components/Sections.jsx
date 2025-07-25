import { registerComponent } from '../utils/components.js';
import { SectionNavigation } from './SectionNavigation.jsx';

/**
 * Sections Component
 *
 * Container component that wraps all the main content sections.
 * Provides the main semantic HTML structure and pagination configuration.
 * Conditionally renders SectionNavigation when pagination is enabled.
 */
export function Sections({
  children,
  id = 'sections-container',
  usePagination = false,
}) {
  return (
    <>
      {usePagination && <SectionNavigation />}
      <main
        id={id}
        data-use-pagination={usePagination.toString()}
        role="main"
        aria-label="Main content sections"
      >
        {children}
      </main>
    </>
  );
}

// Register for CMS export
registerComponent('Sections', Sections, {
  name: 'Sections Container',
  description:
    'Main container for all content sections with optional pagination',
  fields: {
    id: {
      type: 'string',
      description: 'HTML id attribute for the main element',
      default: 'sections-container',
    },
    usePagination: {
      type: 'boolean',
      description: 'Enable pagination and show section navigation',
      default: false,
    },
    children: {
      type: 'component',
      description: 'Child section components',
    },
  },
});
