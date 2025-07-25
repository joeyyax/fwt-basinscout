import { Fragment } from 'preact';
import { registerComponent } from '../utils/components.js';
import { PanelStats } from './PanelStats.jsx';

/**
 * Panel Component
 *
 * A flexible panel component that renders section content and sets data attributes.
 * Props like title, media, marker, stats are used only for data attributes on the panel element.
 * All visible content comes from the sections array.
 * Automatically wraps content in a prose div for consistent typography styling.
 */
export function Panel({
  className = 'panel',
  title,
  media,
  marker,
  stats,
  sections,
  children,
  ...additionalProps
}) {
  // Build the props object with all data attributes
  const panelProps = {
    className,
    ...additionalProps,
  };

  // Extract data attributes from panel props (these don't render content, only set attributes)
  if (title) panelProps['data-title'] = title;

  // Handle media data
  if (media) {
    panelProps['data-media'] = typeof media === 'string' ? media : media.src;
  }

  // Handle marker data
  if (marker) {
    panelProps['data-marker'] = Array.isArray(marker)
      ? marker
          .map((m) => (typeof m === 'string' ? m : `${m.shape},${m.x},${m.y}`))
          .join(';')
      : typeof marker === 'string'
        ? marker
        : `${marker.shape},${marker.x},${marker.y}`;
  }

  // Handle stats data
  if (stats) {
    panelProps['data-stats'] = Array.isArray(stats)
      ? stats
          .map((stat) =>
            typeof stat === 'string' ? stat : `${stat.src},${stat.alt}`
          )
          .join(';')
      : stats;
  }

  const renderContent = () => {
    // If children are provided, use them (for special cases)
    if (children) {
      return children;
    }

    // Render content from sections only - sections is the primary content structure
    return (
      <>
        {sections &&
          sections.map((section, secIndex) => (
            <Fragment key={secIndex}>
              {section.pretitle && (
                <h2 className="pretitle">{section.pretitle}</h2>
              )}
              {section.title && !section.pretitle && <h2>{section.title}</h2>}
              {section.title && section.pretitle && <h3>{section.title}</h3>}
              {section.body && (
                <div dangerouslySetInnerHTML={{ __html: section.body }} />
              )}
              {section.stats &&
                section.stats.map((statGroup, sIndex) => (
                  <Fragment key={sIndex}>
                    {statGroup.pretitle && (
                      <h2 className="pretitle">{statGroup.pretitle}</h2>
                    )}
                    {statGroup.type === 'stats' && (
                      <PanelStats stats={statGroup.stats} />
                    )}
                  </Fragment>
                ))}
            </Fragment>
          ))}
      </>
    );
  };

  return (
    <div {...panelProps}>
      <div className="prose">{renderContent()}</div>
    </div>
  );
}

// Register component for CMS export
registerComponent('Panel', Panel, {
  className: { type: 'string', default: 'panel' },
  title: { type: 'string', default: '' },
  media: { type: 'object', default: null },
  marker: { type: 'array', default: [] },
  stats: { type: 'array', default: [] },
  sections: { type: 'array', default: [], required: true },
});
