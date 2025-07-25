import { registerComponent } from '../utils/components.js';

/**
 * MediaStack Component
 *
 * Container for media items that can be stacked and paginated.
 * Used in sections that display multiple media items with navigation.
 */
export function MediaStack({ className = 'media-stack' }) {
  return <div className={className}></div>;
}

// Register for CMS export
registerComponent('MediaStack', MediaStack, {
  name: 'Media Stack',
  description: 'Container for stackable media items',
  fields: {
    className: {
      type: 'string',
      description: 'CSS classes for the media stack container',
      default: 'media-stack',
    },
  },
});
