import { registerComponent } from '../utils/components.js';

export function BackgroundContainer() {
  return <div id="background-container" className="fixed inset-0 -z-10"></div>;
}

// Register component for CMS export
registerComponent('BackgroundContainer', BackgroundContainer, {
  name: 'Background Container',
  description: 'Container for background elements',
  fields: {},
});
