/**
 * Content Seeding Utilities
 *
 * Utilities for working with content.js data, including validation,
 * transformation, and seeding operations.
 */

import { appData } from '../data/content.js';

/**
 * Validates the structure of content data
 */
export function validateContentStructure(data = appData) {
  const errors = [];

  // Check required top-level sections
  const requiredSections = ['intro', 'map', 'results'];
  requiredSections.forEach((section) => {
    if (!data[section]) {
      errors.push(`Missing required section: ${section}`);
    }
  });

  // Validate each section has required properties
  Object.entries(data).forEach(([sectionName, section]) => {
    if (typeof section !== 'object') return;

    // Check for panels array
    if (!section.panels || !Array.isArray(section.panels)) {
      errors.push(`Section ${sectionName} missing panels array`);
    }

    // Validate panels structure
    section.panels?.forEach((panel, panelIndex) => {
      if (!panel.sections || !Array.isArray(panel.sections)) {
        errors.push(
          `Panel ${panelIndex} in ${sectionName} missing sections array`
        );
      }

      panel.sections?.forEach((sectionData, sectionIndex) => {
        if (!sectionData.title && !sectionData.pretitle && !sectionData.body) {
          errors.push(
            `Section ${sectionIndex} in panel ${panelIndex} of ${sectionName} has no content`
          );
        }
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Seeds the application with transformed content
 */
export function seedContent(transformFn) {
  const transformedData = transformFn ? transformFn(appData) : appData;
  const validation = validateContentStructure(transformedData);

  if (!validation.isValid) {
    console.warn('Content validation failed:', validation.errors);
  }

  return transformedData;
}

/**
 * Extracts all text content for search indexing or analysis
 */
export function extractTextContent(data = appData) {
  const textContent = [];

  Object.entries(data).forEach(([sectionName, section]) => {
    if (typeof section !== 'object') return;

    // Add section title
    if (section.title) {
      textContent.push({
        type: 'section-title',
        section: sectionName,
        content: section.title,
      });
    }

    // Extract from panels
    section.panels?.forEach((panel, panelIndex) => {
      panel.sections?.forEach((sectionData, sectionIndex) => {
        if (sectionData.pretitle) {
          textContent.push({
            type: 'pretitle',
            section: sectionName,
            panel: panelIndex,
            sectionIndex,
            content: sectionData.pretitle,
          });
        }

        if (sectionData.title) {
          textContent.push({
            type: 'title',
            section: sectionName,
            panel: panelIndex,
            sectionIndex,
            content: sectionData.title,
          });
        }

        if (sectionData.body) {
          // Strip HTML tags for text extraction
          const textBody = sectionData.body.replace(/<[^>]*>/g, '').trim();
          textContent.push({
            type: 'body',
            section: sectionName,
            panel: panelIndex,
            sectionIndex,
            content: textBody,
          });
        }

        // Extract stats labels
        sectionData.stats?.forEach((statGroup) => {
          statGroup.stats?.forEach((stat) => {
            if (stat.label) {
              textContent.push({
                type: 'stat-label',
                section: sectionName,
                panel: panelIndex,
                sectionIndex,
                content: stat.label,
              });
            }
          });
        });
      });
    });
  });

  return textContent;
}

/**
 * Creates a summary of content structure
 */
export function summarizeContent(data = appData) {
  const summary = {};

  Object.entries(data).forEach(([sectionName, section]) => {
    if (typeof section !== 'object') return;

    summary[sectionName] = {
      title: section.title || null,
      backgroundImage: section.backgroundImage || null,
      panelCount: section.panels?.length || 0,
      sections: [],
    };

    section.panels?.forEach((panel, panelIndex) => {
      panel.sections?.forEach((sectionData, sectionIndex) => {
        summary[sectionName].sections.push({
          panel: panelIndex,
          section: sectionIndex,
          hasTitle: !!sectionData.title,
          hasPretitle: !!sectionData.pretitle,
          hasBody: !!sectionData.body,
          hasStats: !!(sectionData.stats && sectionData.stats.length > 0),
          wordCount: sectionData.body
            ? sectionData.body.replace(/<[^>]*>/g, '').split(/\s+/).length
            : 0,
        });
      });
    });
  });

  return summary;
}

/**
 * Development utility to log content structure
 */
export function debugContent() {
  const validation = validateContentStructure();
  const summary = summarizeContent();
  const textContent = extractTextContent();

  return {
    validation,
    summary,
    textContent,
  };
}
