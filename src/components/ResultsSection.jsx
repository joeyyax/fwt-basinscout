import { registerComponent } from '../utils/components.js';
import { Section } from './Section.jsx';
import { SectionTitle } from './SectionTitle.jsx';
import { Panels } from './Panels.jsx';

export function ResultsSection({
  title = 'The Results',
  backgroundImage = '/img/bg/results.jpg',
  titleAnimation = 'fade-up',
  useOverflowDetector = true,
  panels = [],
  children,
}) {
  return (
    <Section
      id="results"
      className="section section-results"
      data-background={backgroundImage}
      data-title-animation={titleAnimation}
      data-use-overflow-detector={useOverflowDetector}
    >
      <SectionTitle>{title}</SectionTitle>
      <div className="content-wrapper">
        <Panels dataPanelBorder={true} {...{ panels }} />
      </div>
    </Section>
  );
}

// Register component for CMS export
registerComponent('ResultsSection', ResultsSection, {
  title: { type: 'string', default: 'The Results' },
  backgroundImage: { type: 'string', default: '/img/bg/results.jpg' },
  titleAnimation: { type: 'string', default: 'fade-up' },
  useOverflowDetector: { type: 'boolean', default: true },
  panels: { type: 'array', default: [] },
});
