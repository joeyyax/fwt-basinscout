import { registerComponent } from '../utils/components.js';
import { PanelStatDonut } from './PanelStatDonut.jsx';
import { PanelStatStandard } from './PanelStatStandard.jsx';

/**
 * PanelStats Component
 *
 * A container component that renders a collection of stat components
 * with consistent grid layout and styling.
 *
 * @param {Object} props
 * @param {Array} props.stats - Array of stat objects
 * @param {string} [props.className] - Additional CSS classes
 */
export function PanelStats({ stats = [], className = '' }) {
  const containerClassName =
    `stats grid grid-cols-1 md:grid-cols-11 gap-4 lg:gap-12 ${className}`.trim();

  return (
    <div className={containerClassName} data-stagger-children="true">
      {stats.map((stat, index) => {
        const StatComponent =
          stat.type === 'donut' ? PanelStatDonut : PanelStatStandard;
        return (
          <StatComponent
            key={index}
            value={stat.value}
            label={stat.label}
            sourceUrl={stat.sourceUrl}
          />
        );
      })}
    </div>
  );
}

// Register component for CMS export
registerComponent('PanelStats', PanelStats, {
  name: 'Panel Statistics',
  description:
    'A container for displaying multiple statistics in a grid layout',
  fields: {
    stats: {
      type: 'array',
      label: 'Statistics',
      fields: {
        type: {
          type: 'select',
          label: 'Stat Type',
          options: ['donut', 'standard'],
          default: 'standard',
        },
        value: {
          type: 'text',
          label: 'Stat Value',
          required: true,
        },
        label: {
          type: 'textarea',
          label: 'Stat Label',
          required: true,
        },
        sourceUrl: {
          type: 'url',
          label: 'Source URL',
        },
      },
    },
  },
});
