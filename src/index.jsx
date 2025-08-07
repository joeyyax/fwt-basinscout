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
    // Animation system is now handled by the App component through hooks
    render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
      appContainer
    );
  }
});
