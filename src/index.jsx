import { render } from 'preact';
import { App } from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

// Import styles first
import './styles/style.css';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    // Render Preact app with error boundary
    render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
      appContainer
    );

    // Then initialize JavaScript after a short delay to ensure DOM is ready
    setTimeout(() => {
      import('./scripts/main.js');
    }, 100);
  }
});
