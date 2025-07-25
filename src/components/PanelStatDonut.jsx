import { registerComponent } from '../utils/components.js';

/**
 * PanelStatDonut Component
 *
 * A donut chart statistic component with circular progress display.
 *
 * @param {Object} props
 * @param {string} props.value - The main value to display (percentage will be extracted)
 * @param {string} props.label - The descriptive label text
 * @param {string} [props.sourceUrl] - Optional URL for the source link
 * @param {string} [props.className] - Additional CSS classes
 */
export function PanelStatDonut({
  value,
  label,
  sourceUrl,
  className = '',
  style = {},
  ...additionalProps
}) {
  // Auto-determine grid span for donut charts
  const gridSpan = 'col-span-1 md:col-span-4';
  const baseClassName = `stat stat-donut ${gridSpan}`;
  const fullClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName;

  // Extract percentage from value for donut charts
  const getPercentageFromValue = (val) => {
    if (!val || typeof val !== 'string') return 0;
    const match = val.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const percentage = getPercentageFromValue(value);

  return (
    <div className={fullClassName} style={style} {...additionalProps}>
      <div className="stat-donut-chart">
        <svg viewBox="0 0 42 42" className="circular-chart">
          <path
            className="circle-bg"
            d="M21 5 a 16 16 0 1 0 0 32 a 16 16 0 1 0 0 -32"
          />
          <path
            className="circle"
            strokeDasharray="0, 100"
            d="M21 5 a 16 16 0 1 0 0 32 a 16 16 0 1 0 0 -32"
            data-target-value={percentage}
          />
        </svg>
      </div>
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
registerComponent('PanelStatDonut', PanelStatDonut, {
  name: 'Panel Statistic (Donut Chart)',
  description:
    'A donut chart statistic component with circular progress display',
  fields: {
    value: {
      type: 'text',
      label: 'Stat Value',
      required: true,
      help: 'The percentage value to display (e.g., "51%"). The percentage will be extracted for the chart animation.',
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
