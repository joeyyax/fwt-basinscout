import { registerComponent } from '../utils/components.js';
import { Section } from './Section.jsx';
import { SectionTitle } from './SectionTitle.jsx';
import { Panels } from './Panels.jsx';
import { PanelNavigation } from './PanelNavigation.jsx';
import { MediaStack } from './MediaStack.jsx';

export function MapSection({
  title = 'Understanding the Landscape',
  backgroundImage = '/img/bg/2a Base Map Medium.jpg',
  backgroundBlur = '3px',
  titleAnimation = 'slide-right',
  usePagination = true,
  panels = [],
  children,
}) {
  return (
    <Section
      id="map"
      className="section section-map"
      data-background={backgroundImage}
      data-background-blur={backgroundBlur}
      data-title-animation={titleAnimation}
      data-use-pagination={usePagination ? 'true' : 'false'}
    >
      <SectionTitle>{title}</SectionTitle>
      <div className="content-wrapper">
        <div className="columns grid grid-cols-1 lg:grid-cols-24 gap-4 lg:gap-8 w-full">
          <div className="column hidden lg:block lg:col-span-1">
            <PanelNavigation />
          </div>
          <div className="column col-span-1 lg:col-span-15">
            <MediaStack />
          </div>
          <div className="column col-span-1 lg:col-span-8">
            <Panels {...{ panels }} />
          </div>
        </div>
      </div>
    </Section>
  );
}

// Register component for CMS export
registerComponent('MapSection', MapSection, {
  title: { type: 'string', default: 'Understanding the Landscape' },
  backgroundImage: {
    type: 'string',
    default: '/img/bg/2a Base Map Medium.jpg',
  },
  backgroundBlur: { type: 'string', default: '3px' },
  titleAnimation: { type: 'string', default: 'slide-right' },
  usePagination: { type: 'boolean', default: true },
  panels: { type: 'array', default: [] },
});
