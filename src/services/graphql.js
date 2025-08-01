/**
 * GraphQL Service
 *
 * Handles GraphQL queries for BasinScout data from Craft CMS
 */

import { GraphQLClient } from 'graphql-request';

// GraphQL endpoint - can be overridden via environment variable or window config
const getGraphQLEndpoint = () => {
  // Check for window configuration first (from Craft CMS template)
  if (
    typeof window !== 'undefined' &&
    window.BASINSCOUT_CONFIG?.graphqlEndpoint
  ) {
    return window.BASINSCOUT_CONFIG.graphqlEndpoint;
  }

  // Fallback to environment variable or default
  const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || '/api/graphql';

  // Ensure we have a valid URL for development
  if (endpoint.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${endpoint}`;
  }

  return endpoint;
};

// Create GraphQL client with dynamic endpoint
const getClient = () => {
  return new GraphQLClient(getGraphQLEndpoint(), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * GraphQL query based on actual BasinScout CraftCMS schema
 * Now adding Matrix fields with proper nested inline fragments
 */
const BASINSCOUT_QUERY = `
  query GetBasinScoutContent {
    basinscoutEntries(limit: 1) {
      ... on basinScout_Entry {
        id
        title
        slug
        dateCreated
        dateUpdated
        headerLogo {
          id
          title
          url
        }
        headerLogoAlt
        headerHomeUrl
        headerCtaText
        headerCtaUrl
        introTitle
        introBackgroundImage {
          id
          title
          url
        }
        mapTitle
        mapBackgroundImage {
          id
          title
          url
        }
        resultsTitle
        resultsBackgroundImage {
          id
          title
          url
        }
        introPanels {
          ... on introPanel_Entry {
            id
            title
            introContentSections {
              ... on contentSection_Entry {
                id
                sectionPretitle
                sectionTitle
                sectionContent {
                  html
                }
                sectionStats {
                  statType
                  value
                  label
                  source
                }
              }
            }
          }
        }
        mapPanels {
          ... on mapPanel_Entry {
            id
            title
            mapMedia {
              id
              title
              url
            }
            mapStats {
              ... on mapStat_Entry {
                id
                statImage {
                  id
                  title
                  url
                }
                statAlt
              }
            }
            mapMarkers {
              x
              y
              type
            }
            mapContentSections {
              ... on mapContentSection_Entry {
                id
                sectionPretitle
                sectionTitle
                sectionContent {
                  html
                }
              }
            }
          }
        }
        resultsPanels {
          ... on resultsPanel_Entry {
            id
            title
            resultsContentSections {
              ... on contentSection_Entry {
                id
                sectionPretitle
                sectionTitle
                sectionContent {
                  html
                }
                sectionStats {
                  statType
                  value
                  label
                  source
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Transform GraphQL response from BasinScout CraftCMS schema with Matrix fields
 * Pure data transformation without fallback content
 */
function transformGraphQLData(data) {
  const entry = data.basinscoutEntries?.[0];
  if (!entry) {
    throw new Error('No BasinScout entry found in CraftCMS');
  }

  // Transform the CraftCMS data to match the app's expected structure
  return {
    header: {
      logoSrc: entry.headerLogo?.[0]?.url,
      logoAlt: entry.headerLogoAlt,
      homeUrl: entry.headerHomeUrl,
      ctaText: entry.headerCtaText,
      ctaUrl: entry.headerCtaUrl,
    },
    intro: {
      backgroundImage: entry.introBackgroundImage?.[0]?.url,
      title: entry.introTitle,
      useOverflowDetector: true,
      panels:
        entry.introPanels?.map((panel) => ({
          sections:
            panel.introContentSections?.map((section) => ({
              pretitle: section.sectionPretitle,
              title: section.sectionTitle,
              body: section.sectionContent?.html,
              stats:
                section.sectionStats?.length > 0
                  ? [
                      {
                        type: 'stats',
                        stats: section.sectionStats.map((stat) => ({
                          type: stat.statType,
                          value: stat.value,
                          label: stat.label,
                          sourceUrl: stat.source,
                        })),
                      },
                    ]
                  : [],
            })) || [],
        })) || [],
    },
    map: {
      backgroundImage: entry.mapBackgroundImage?.[0]?.url,
      title: entry.mapTitle,
      panels:
        entry.mapPanels?.map((panel) => ({
          title: panel.title,
          media: panel.mapMedia?.[0]?.url || null,
          marker:
            panel.mapMarkers?.map((marker) => ({
              shape: marker.type, // Map 'type' to 'shape' for app compatibility
              x: marker.x,
              y: marker.y,
            })) || [],
          stats:
            panel.mapStats?.map((stat) => ({
              src: stat.statImage?.[0]?.url,
              alt: stat.statAlt,
            })) || [],
          sections:
            panel.mapContentSections?.map((section) => ({
              pretitle: section.sectionPretitle,
              title: section.sectionTitle,
              body: section.sectionContent?.html,
            })) || [],
        })) || [],
    },
    results: {
      backgroundImage: entry.resultsBackgroundImage?.[0]?.url,
      title: entry.resultsTitle,
      panels:
        entry.resultsPanels?.map((panel) => ({
          sections:
            panel.resultsContentSections?.map((section) => ({
              pretitle: section.sectionPretitle,
              title: section.sectionTitle,
              body: section.sectionContent?.html,
              stats:
                section.sectionStats?.length > 0
                  ? [
                      {
                        type: 'stats',
                        stats: section.sectionStats.map((stat) => ({
                          type: stat.statType,
                          value: stat.value,
                          label: stat.label,
                          sourceUrl: stat.source,
                        })),
                      },
                    ]
                  : [],
            })) || [],
        })) || [],
    },
  };
}

/**
 * Fetch BasinScout data from GraphQL API
 */
export async function fetchBasinScoutData() {
  const endpoint = getGraphQLEndpoint();
  const client = new GraphQLClient(endpoint);
  try {
    const data = await client.request(BASINSCOUT_QUERY);
    return transformGraphQLData(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('GraphQL query failed:', error);
    throw error;
  }
}

/**
 * Check if GraphQL endpoint is available
 */
export async function isGraphQLAvailable() {
  try {
    // Simple introspection query to check if endpoint is available
    const client = getClient();
    await client.request(`{ __typename }`);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('GraphQL endpoint not available:', error.message);
    return false;
  }
}
