import { registerComponent } from '../utils/components.js';

/**
 * Section Component
 *
 * A reusable section wrapper that handles common section attributes
 * and provides a consistent structure for all page sections.
 *
 * @param {Object} props
 * @param {string} props.id - Section ID
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.data-background] - Background image path
 * @param {string} [props.data-background-scale] - Background scale values
 * @param {string} [props.data-background-rotate] - Background rotation values
 * @param {string} [props.data-background-opacity] - Background opacity values
 * @param {string} [props.data-background-blur] - Background blur effect
 * @param {string} [props.data-title-animation] - Title animation type
 * @param {string} [props.data-use-pagination] - Enable pagination for this section
 * @param {string} [props.data-use-overflow-detector] - Enable overflow detection
 * @param {string} [props.aria-labelledby] - ARIA labelledby attribute
 * @param {React.ReactNode} props.children - Section content
 */
export function Section({ id, className = 'section', children, ...props }) {
  return (
    <section id={id} className={className} {...props}>
      <div className="container">{children}</div>
    </section>
  );
}

// Register component for CMS export
registerComponent('Section', Section, {
  name: 'Section Wrapper',
  description: 'A reusable section component with common attributes',
  fields: {
    id: {
      type: 'text',
      label: 'Section ID',
      required: true,
    },
    className: {
      type: 'text',
      label: 'CSS Classes',
      default: 'section',
    },
    'data-background': {
      type: 'image',
      label: 'Background Image',
    },
    'data-background-scale': {
      type: 'text',
      label: 'Background Scale',
      help: 'Format: "x y" (e.g., "1.6 1.0")',
    },
    'data-background-rotate': {
      type: 'text',
      label: 'Background Rotation',
      help: 'Format: "x y" (e.g., "5deg 0deg")',
    },
    'data-background-opacity': {
      type: 'text',
      label: 'Background Opacity',
      help: 'Format: "start end" (e.g., "0 1")',
    },
    'data-background-blur': {
      type: 'text',
      label: 'Background Blur',
      help: 'CSS blur value (e.g., "3px")',
    },
    'data-title-animation': {
      type: 'select',
      label: 'Title Animation',
      options: ['fade-up', 'slide-right', 'fade-in', 'none'],
    },
    'data-use-pagination': {
      type: 'boolean',
      label: 'Enable Pagination',
    },
    'data-use-overflow-detector': {
      type: 'boolean',
      label: 'Enable Overflow Detection',
    },
  },
});
