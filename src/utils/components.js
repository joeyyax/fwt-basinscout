import { render } from 'preact';

/**
 * Component registration system for CMS export
 * This tracks components and their schemas for automated CMS generation
 */
const COMPONENT_REGISTRY = new Map();

export function registerComponent(name, component, schema) {
  COMPONENT_REGISTRY.set(name, { component, schema });
}

export function getRegisteredComponents() {
  return COMPONENT_REGISTRY;
}

/**
 * Helper to render Preact components to DOM
 */
export function renderComponent(component, container) {
  render(component, container);
}

/**
 * Helper to clear a container
 */
export function clearContainer(container) {
  render(null, container);
}
