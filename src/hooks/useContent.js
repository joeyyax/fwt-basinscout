/**
 * Content Hook
 *
 * Provides unified data access for BasinScout app.
 * Attempts to fetch from GraphQL first, falls back to static content.js
 */

import { useState, useEffect } from 'preact/hooks';
import { fetchBasinScoutData } from '../services/graphql.js';

// Fallback data for development/offline mode
import { appData as fallbackData } from '../data/content.js';

// Get content source from environment
const CONTENT_SOURCE = import.meta.env.VITE_CONTENT_SOURCE || 'graphql';

/**
 * Custom hook for fetching content data
 * Uses either local static data or GraphQL based on VITE_CONTENT_SOURCE
 */
export function useContent() {
  const [data, setData] = useState(fallbackData); // Always start with fallback data
  const [loading, setLoading] = useState(CONTENT_SOURCE === 'graphql'); // Only loading for GraphQL
  const [error, setError] = useState(null);
  const [source, setSource] = useState(
    CONTENT_SOURCE === 'local' ? 'local' : 'fallback'
  );

  const loadData = async () => {
    // If using local content source, don't fetch from GraphQL
    if (CONTENT_SOURCE === 'local') {
      return; // Data already set to fallbackData in useState
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
