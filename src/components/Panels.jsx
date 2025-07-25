import { registerComponent } from '../utils/components.js';
import { Panel } from './Panel.jsx';

/**
 * Panels Component
 *
 * A container component for multiple Panel components.
 * Can either render children directly or accept a panels array and map to Panel components automatically.
 * Supports different container styles and data attributes for panel behavior.
 */
export function Panels({
  className = 'panels-container',
  dataPanelBorder,
  panels,
  children,
  ...additionalProps
}) {
  // Build the props object
  const panelsProps = {
    className,
    ...additionalProps,
  };

  // Add data attributes if provided
  if (dataPanelBorder !== undefined) {
    panelsProps['data-panel-border'] = dataPanelBorder.toString();
  }

  const renderContent = () => {
    // If children are provided, use them (backward compatibility)
    if (children) {
      return children;
    }

    // If panels array is provided, map to Panel components
    if (panels) {
      return panels.map((panel, index) => <Panel key={index} {...panel} />);
    }

    // Fallback to empty
    return null;
  };

  return <div {...panelsProps}>{renderContent()}</div>;
}

// Register component for CMS export
registerComponent('Panels', Panels, {
  className: { type: 'string', default: 'panels-container' },
  dataPanelBorder: { type: 'boolean', default: false },
  panels: { type: 'array', default: [] },
});
