import { registerComponent } from '../utils/components.js';
import { Section } from './Section.jsx';
import { SectionTitle } from './SectionTitle.jsx';
import { Panels } from './Panels.jsx';

export function IntroSection({
  backgroundImage = '/img/bg/2a Base Map Medium.jpg',
  backgroundScale = '1.6 1.0',
  backgroundRotate = '5deg 0deg',
  backgroundOpacity = '0 1',
  titleAnimation = 'fade-up',
  useOverflowDetector = true,
  title,
  panels = [],
  children,
}) {
  return (
    <Section
      id="intro"
      className="section section-intro"
      data-background={backgroundImage}
      data-background-scale={backgroundScale}
      data-background-rotate={backgroundRotate}
      data-background-opacity={backgroundOpacity}
      data-title-animation={titleAnimation}
      data-use-overflow-detector={useOverflowDetector}
      aria-labelledby="section-1-title"
    >
      <SectionTitle id="section-1-title" dangerouslySetInnerHTML={true}>
        {title}
      </SectionTitle>

      <div className="content-wrapper">
        <Panels dataPanelBorder={true} {...{ panels }} />
      </div>
    </Section>
  );
}

// Register component for CMS export
registerComponent('IntroSection', IntroSection, {
  backgroundImage: {
    type: 'string',
    default: '/img/bg/2a Base Map Medium.jpg',
  },
  backgroundScale: { type: 'string', default: '1.6 1.0' },
  backgroundRotate: { type: 'string', default: '5deg 0deg' },
  backgroundOpacity: { type: 'string', default: '0 1' },
  titleAnimation: { type: 'string', default: 'fade-up' },
  useOverflowDetector: { type: 'boolean', default: true },
  title: { type: 'string', default: 'BasinScout®' },
  panels: { type: 'array', default: [] },
});
