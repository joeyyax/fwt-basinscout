import { registerComponent } from '../utils/components.js';

/**
 * PanelStatStandard Component
 *
 * A standard statistic component with simple value/label display.
 *
 * @param {Object} props
 * @param {string} props.value - The main value to display
 * @param {string} props.label - The descriptive label text
 * @param {string} [props.sourceUrl] - Optional URL for the source link
 * @param {string} [props.className] - Additional CSS classes
 */
export function PanelStatStandard({
  value,
  label,
  sourceUrl,
  className = '',
  style = {},
  ...additionalProps
}) {
  // Auto-determine grid span for standard stats
  const gridSpan = 'col-span-1 md:col-span-3';
  const baseClassName = `stat stat-standard ${gridSpan}`;
  const fullClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName;

  return (
    <div className={fullClassName} style={style} {...additionalProps}>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">
          {label}
          {sourceUrl ? (
            <span>
              {' '}
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline hover:text-white/80"
              >
                (source)
              </a>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Register component for CMS export
registerComponent('PanelStatStandard', PanelStatStandard, {
  name: 'Panel Statistic (Standard)',
  description: 'A standard statistic component with simple value/label display',
  fields: {
    value: {
      type: 'text',
      label: 'Stat Value',
      required: true,
      help: 'The main value to display (e.g., "#1", "150+", "2.5M")',
    },
    label: {
      type: 'textarea',
      label: 'Stat Label',
      required: true,
      help: 'The descriptive text for this statistic',
    },
    sourceUrl: {
      type: 'url',
      label: 'Source URL',
      help: 'Optional link to the data source',
    },
  },
});
