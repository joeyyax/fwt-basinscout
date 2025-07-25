import { registerComponent } from '../utils/components.js';

export function ReturnToTop() {
  return (
    <button
      id="return-to-top"
      class="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 pointer-events-none z-50"
      aria-label="Return to top"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        ></path>
      </svg>
    </button>
  );
}

// Register component for CMS export
registerComponent('ReturnToTop', ReturnToTop, {
  name: 'Return To Top Button',
  description: 'Button to return to the top of the page',
  fields: {},
});
<div id="background-container" className="fixed inset-0 -z-10"></div>;
