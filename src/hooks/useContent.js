/**
 * Content Hook
 *
 * Provides unified data access for BasinScout app.
 * - GraphQL mode: Only uses GraphQL data, never content.js
 * - Local mode: Uses only static content.js data
 */

import { useState, useEffect } from 'preact/hooks';
import { fetchBasinScoutData } from '../services/graphql.js';

// Get content source from environment
const CONTENT_SOURCE = import.meta.env.VITE_CONTENT_SOURCE || 'graphql';

/**
 * Custom hook for fetching content data
 * - GraphQL mode: Only uses GraphQL data, never content.js
 * - Local mode: Uses only static content.js data
 */
export function useContent() {
  // Initialize data based on content source - null initially
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(CONTENT_SOURCE === 'graphql');
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const loadData = async () => {
    // If using local content source, load static data only
    if (CONTENT_SOURCE === 'local') {
      try {
        // Dynamically import content.js only when using local mode
        const contentModule = await import('../data/content.js');
        setData(contentModule.appData);
        setSource('local');
      } catch (localError) {
        console.error('Failed to load static content:', localError);
        setError(localError);
      }
      return;
    }

    // Only fetch from GraphQL if content source is 'graphql'
    setLoading(true);
    setError(null);

    try {
      const graphqlData = await fetchBasinScoutData();
      setData(graphqlData);
      setSource('graphql');
    } catch (graphqlError) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch GraphQL data:', graphqlError);
      setError(graphqlError);
      // In GraphQL mode, we don't fall back to content.js
      // The app should handle the error state appropriately
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    source,
    retry: loadData,
    isGraphQL: source === 'graphql',
    isLocal: source === 'local',
  };
}

/**
 * Data Provider Component (optional wrapper for context)
 * Can be used if you prefer React Context pattern
 */
export function DataProvider({ children }) {
  // For now, just pass through children
  // In the future, you could provide context here with useBasinScoutData()
  return children;
}
