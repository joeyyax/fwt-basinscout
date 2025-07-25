import { registerComponent } from '../utils/components.js';

/**
 * SectionTitle Component
 *
 * A reusable title component for sections that provides consistent
 * styling and structure for section headings.
 *
 * @param {Object} props
 * @param {string} props.children - The title text content
 * @param {string} [props.id] - Optional ID for the heading element
 * @param {string} [props.level] - Heading level (h1, h2, h3, etc.) - defaults to h1
 * @param {string} [props.className] - Additional CSS classes for the wrapper
 * @param {boolean} [props.dangerouslySetInnerHTML] - Whether to use dangerouslySetInnerHTML
 */
export function SectionTitle({
  children,
  id,
  level = 'h1',
  className = '',
  dangerouslySetInnerHTML = false,
}) {
  const wrapperClassName = `title-wrapper ${className}`.trim();
  const HeadingTag = level;

  if (dangerouslySetInnerHTML && typeof children === 'string') {
    return (
      <div className={wrapperClassName}>
        <HeadingTag id={id} dangerouslySetInnerHTML={{ __html: children }} />
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <HeadingTag id={id}>{children}</HeadingTag>
    </div>
  );
}

// Register component for CMS export
registerComponent('SectionTitle', SectionTitle, {
  name: 'Section Title',
  description: 'A title component for sections with consistent styling',
  fields: {
    children: {
      type: 'text',
      label: 'Title Text',
      required: true,
      help: 'The text content for the section title',
    },
    id: {
      type: 'text',
      label: 'Element ID',
      help: 'Optional ID attribute for the heading element',
    },
    level: {
      type: 'select',
      label: 'Heading Level',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      default: 'h1',
      help: 'The semantic heading level for accessibility',
    },
    dangerouslySetInnerHTML: {
      type: 'boolean',
      label: 'Allow HTML',
      default: false,
      help: 'Whether to render HTML content (use with caution)',
    },
  },
});
