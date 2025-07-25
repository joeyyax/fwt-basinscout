import { registerComponent } from '../utils/components.js';

/**
 * PanelNavigation Component
 *
 * Renders pagination navigation for panels.
 * Used in sections that have multiple panels with pagination enabled.
 */
export function PanelNavigation({
  className = 'pagination pagination-panel',
  dataMatchHeight = '.media-stack .media-item:first-of-type',
}) {
  return <div className={className} data-match-height={dataMatchHeight}></div>;
}

// Register for CMS export
registerComponent('PanelNavigation', PanelNavigation, {
  name: 'Panel Navigation',
  description: 'Pagination navigation for panels',
  fields: {
    className: {
      type: 'string',
      description: 'CSS classes for the navigation element',
      default: 'pagination pagination-panel',
    },
    dataMatchHeight: {
      type: 'string',
      description: 'Selector for height matching',
      default: '.media-stack .media-item:first-of-type',
    },
  },
});
