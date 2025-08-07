import { useState, useEffect } from 'preact/hooks';
import { registerComponent } from './utils/components.js';
import { Header } from './components/Header.jsx';
import { BackgroundContainer } from './components/BackgroundContainer.jsx';
import { Sections } from './components/Sections.jsx';
import { IntroSection } from './components/IntroSection.jsx';
import { MapSection } from './components/MapSection.jsx';
import { ResultsSection } from './components/ResultsSection.jsx';
import { ReturnToTop } from './components/ReturnToTop.jsx';
import { ErrorModal } from './components/ErrorModal.jsx';
import { useContent } from './hooks/useContent.js';
import {
  useAnimationSystem,
  useGSAPSetup,
} from './hooks/useAnimationSystem.js';
import { SectionAnimationController } from './scripts/animations/sections.js';

/**
 * Main App Component
 *
 * Fetches data from GraphQL API with fallback to static content.
 * Automatically detects data source and renders accordingly.
 */
export function App() {
  const { data, loading, error, source, retry } = useContent();
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Initialize GSAP setup immediately to prevent FOUC
  useGSAPSetup();

  // Initialize animation system with proper dependency management
  const animationSystem = useAnimationSystem(data, source);

  // Reinitialize background system when GraphQL data loads (replaces hacky 100ms timeout)
  useEffect(() => {
    if (source === 'graphql' && data) {
      // Use requestAnimationFrame instead of setTimeout - eliminates the hacky delay
      requestAnimationFrame(() => {
        SectionAnimationController.initializeBackgroundSystem();
      });
    }
  }, [source, data]);

  // Show error modal when there's an error and we have data to show underneath
  if (error && data && !showErrorModal) {
    setShowErrorModal(true);
  }

  // Show empty loading state when no data is available and we're fetching
  if (loading && !data) {
    return <div>Loading...</div>;
  }

  // Extract data (should always be available due to fallback)
  const { header, intro, map, results } = data || {};

  return (
    <>
      <BackgroundContainer />

      {/* Header with data from GraphQL or fallback */}
      <Header
        logoSrc={header?.logoSrc}
        logoAlt={header?.logoAlt}
        homeUrl={header?.homeUrl}
        ctaText={header?.ctaText}
        ctaUrl={header?.ctaUrl}
      />

      <Sections usePagination={false}>
        <IntroSection
          backgroundImage={intro.backgroundImage}
          backgroundScale="1.6 1.0"
          backgroundRotate="5deg 0deg"
          backgroundOpacity="0 1"
          titleAnimation="fade-up"
          title={intro.title}
          useOverflowDetector={intro.useOverflowDetector}
          panels={intro.panels}
        />

        <MapSection
          backgroundImage={map.backgroundImage}
          backgroundBlur={map.backgroundBlur}
          titleAnimation={map.titleAnimation}
          title={map.title}
          usePagination={map.usePagination}
          panels={map.panels}
        />

        <ResultsSection
          backgroundImage={results.backgroundImage}
          titleAnimation={results.titleAnimation}
          title={results.title}
          useOverflowDetector={results.useOverflowDetector}
          panels={results.panels}
        />
      </Sections>

      <ReturnToTop />

      {/* Error Modal for GraphQL failures */}
      <ErrorModal
        isOpen={showErrorModal}
        title="Loading Error"
        message="There was an issue loading content. Please check your internet connection and try again."
        error={error}
        onRetry={async () => {
          setShowErrorModal(false);
          await retry();
        }}
        onClose={() => setShowErrorModal(false)}
      />
    </>
  );
}

// Register for CMS export
registerComponent('App', App, {
  name: 'BasinScout Application',
  description:
    'Main application component that renders the entire BasinScout interface. Supports both JSON data from Craft CMS and static fallback data.',
  fields: {
    // No fields needed - data comes from JSON API or static content
  },
});
