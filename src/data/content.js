/**
 * Application Data
 *
 * Contains all the structured data for the BasinScout application.
 * This includes content for intro, map, and results sections with their panels and sections.
 */

export const appData = {
  intro: {
    backgroundImage: '/img/bg/2a Base Map Medium.jpg',
    title: `BasinScout<sup className="font-light">&reg;</sup>`,
    useOverflowDetector: true,
    panels: [
      {
        sections: [
          {
            title: 'Turning Data into Action and Action into Sustainability',
            body: `
              <p>In a world where conservation dollars often go to waste
                      and impact is difficult to measure, The Freshwater Trust
                      challenges the status quo with a groundbreaking
                      approach—delivering effective, efficient freshwater
                      restoration that drives real, measurable change.</p>
            `,
            stats: [
              {
                pretitle: 'The Problem',
                type: 'stats',
                stats: [
                  {
                    type: 'donut',
                    value: '>51%',
                    label: 'of our freshwater ecosystems are unhealthy.',
                    sourceUrl:
                      'https://thehill.com/changing-america/sustainability/environment/600070-about-half-of-us-water-too-polluted-for-swimming/',
                  },
                  {
                    type: 'standard',
                    value: '#1',
                    label:
                      'cause of water quality impacts on rivers and streams is agricultural runoff.',
                    sourceUrl:
                      'https://www.epa.gov/nps/nonpoint-source-agriculture',
                  },
                  {
                    type: 'donut',
                    value: '38%',
                    label:
                      'of U.S. agriculture still uses outdated irrigation methods from the 1800s.',
                    sourceUrl: 'https://sgp.fas.org/crs/misc/R44158.pdf',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        sections: [
          {
            pretitle: 'The Solution',
            title: 'Sustainability and clean water',
            body: `
              <p>Properly designed and managed irrigation systems can minimize water pollution by reducing nutrient and chemical runoff into freshwater systems.</p>
            `,
          },
          {
            pretitle: 'How We Do It',
            title: 'Address irrigation and the direct benefit to farms',
            body: `
              <p>The Freshwater Trust uses its patented BasinScout analytics to identify the fields where the biggest improvements can be made for the lowest cost. This improves water quality, groundwater sustainability and surface water management. Upgrading irrigation systems can lower water usage, reduce costs and increase soil health, leading to improved crop yields.</p>
            `,
          },
        ],
      },
    ],
  },
  results: {
    title: 'Making an Impact Quantified',
    backgroundImage: '/img/bg/results.jpg',
    titleAnimation: 'fade-up',
    useOverflowDetector: true,
    panels: [
      {
        sections: [
          {
            title: 'Better Water, Better Land, Better Future',
            body: `
              <p>The current conservation funding system is broken. Billions of dollars are spent annually on projects that don't yield substantial improvements for farmers and rivers.</p>
              <p>The Freshwater Trust is changing the game.</p>
              <p>By leveraging refined data insights, we pinpoint high-risk areas, determine how to get the biggest improvements for the lowest cost and ensure every dollar drives maximum impact. Through partnerships with supply chains—like irrigation equipment suppliers—we implement strategic upgrades for maximum return on investment while enabling farmers to identify, prioritize and effectively guide projects to maximize water savings.</p>
              <p>This is one example of how The Freshwater Trust is using data to simplify complicated funding systems, make better use of government resources, and deliver the best value for every dollar spent.</p>
              <p>Our proven approach has unlocked over $1 billion in conservation funding—but there's still more to do.</p>
            `,
          },
        ],
      },
    ],
  },
  map: {
    title: 'Understanding the Landscape',
    backgroundImage: '/img/bg/2a Base Map Medium.jpg',
    backgroundBlur: '3px',
    titleAnimation: 'slide-right',
    usePagination: true,
    panels: [
      {
        media: {
          src: '/img/2_Base and Stage Maps/TFT-Map_2b_Fields-Overview_Map-Behind.png',
          alt: 'BasinScout field overview map showing integrated datasets',
        },
        sections: [
          {
            body: `
          <p>BasinScout can quickly map an entire basin by integrating public datasets—such as soils, crop types, slope and weather—with vetted models for reducing nitrogen and phosphorus (fertilizer) runoff, pinpointing priorities based on the biggest benefits for the lowest cost.</p>
          <p class="mt-auto">* This is a simulation of BasinScout.</p>
        `,
          },
        ],
      },
      {
        title: 'How BasinScout Works',
        media: {
          src: '/img/3_Stage Maps/TFT-Map_3a_One-Color-Fields.png',
          alt: 'Map showing thousands of agricultural fields processed simultaneously',
        },
        sections: [
          {
            body: `
          <p>The tool processes data—along with satellite imagery and other remote sensing inputs—<strong>across thousands of agricultural fields simultaneously</strong>, significantly improving the scale and efficiency of analysis.</p>
        `,
          },
        ],
      },
      {
        media: {
          src: '/img/3_Stage Maps/TFT-Map_3b_Upgradable-vs-Non.png',
          alt: 'Map distinguishing upgradable vs non-upgradable irrigation fields',
        },
        sections: [
          {
            body: `
          <p>For irrigated farm fields, BasinScout identifies opportunities to upgrade to an irrigation method that uses less water.</p>
        `,
          },
        ],
      },
      {
        media: {
          src: '/img/4_Stage Maps/TFT-Map_4_Selected-Field.png',
          alt: 'Selected field analysis with detailed modeling data',
        },
        marker: [{ shape: 'square', x: 67, y: 44 }],
        stats: [
          {
            src: '/img/4_Stage Maps/4_Stats/TFT_4_Stat-1.png',
            alt: 'Water quality improvement data',
          },
          {
            src: '/img/4_Stage Maps/4_Stats/TFT_4_Stat-2.png',
            alt: 'Cost analysis report',
          },
          {
            src: '/img/4_Stage Maps/4_Stats/TFT_4_Stat-3.png',
            alt: 'Timeline projection',
          },
          {
            src: '/img/4_Stage Maps/4_Stats/TFT_4_Stat-4.png',
            alt: 'Environmental impact metrics',
          },
          {
            src: '/img/4_Stage Maps/4_Stats/TFT_4_Stat-5.png',
            alt: 'Field upgrade recommendations',
          },
          {
            src: '/img/4_Stage Maps/4_Stats/TFT_4_Stat-6.png',
            alt: 'Implementation strategy',
          },
        ],
        sections: [
          {
            body: `
          <p>Additional modeling and analysis consider water goals, costs and timelines.</p>
          <p>This analysis can tell us everything from what type of irrigation upgrade is available for each field to how much an upgrade will reduce runoff and improve water quality.</p>
        `,
          },
        ],
      },
      {
        title: 'Connecting the Dots',
        media: {
          src: '/img/5_Stage Maps/TFT-Map_5-6-7_Supply+Drain+Dots_Animation.gif',
          alt: 'Animation showing water flow from rivers to fields and back',
        },
        sections: [
          {
            body: `
          <p>An additional variable in this analysis is <strong>how water flows from the river to the fields.</strong></p>
          <p>And, more importantly, <strong>how water from the fields returns to the river</strong>.</p>
          <p>This allows The Freshwater Trust to identify <strong>agricultural drains</strong> connected to multiple upgradable fields with the most potential to benefit the river.</p>
        `,
          },
        ],
      },
      {
        media: {
          src: '/img/7_Stage Maps/TFT-Map_7a_Drain-Canals+Drain-Dots.png',
          alt: 'Map showing drain canals and drainage points across the basin',
        },
        sections: [
          {
            body: `
          <p>Excess phosphorus and nitrogen combine from different sources. Without natural processes to slow or filter them, even small amounts of these elements can add up and significantly impair water quality. For example, they can create algae blooms that are harmful to humans, animals and fish.</p>
        `,
          },
        ],
      },
      {
        media: {
          src: '/img/7_Stage Maps/TFT-Map_7b_3_1-with-Fields.png',
          alt: 'Agricultural fields connected to a single drainage point',
        },
        marker: [{ shape: 'circle', x: 38.5, y: 21.5 }],
        sections: [
          {
            body: `
          <p>Now, we can observe all the agricultural fields linked to a river through <strong>a single drain.</strong> This allows us to determine which combination of fields to prioritize and begin collaborating with water users to secure funding and make changes.</p>
        `,
          },
        ],
      },
      {
        title: 'Deciphering the Data',
        media: {
          src: '/img/8_Stage Maps/TFT-Map_8_3_1-with-Fields.png',
          alt: 'Data analysis of 600,000 acres mapped to identify 50,000 priority acres',
        },
        marker: [{ shape: 'circle', x: 38, y: 38 }],
        sections: [
          {
            body: `
          <p>In this basin, we have mapped more than <strong>600,000 acres to determine the 50,000 that matter most.</strong> BasinScout lets us quickly see the fields and drains that have the biggest impact on the river.</p>
        `,
          },
        ],
      },
      {
        media: {
          src: '/img/8_Stage Maps/TFT-Map_8_3_1-with-Fields.png',
          alt: 'Detailed drain scorecard showing field connectivity and impact metrics',
        },
        marker: [{ shape: 'circle', x: 38, y: 38 }],
        stats: [
          {
            src: '/img/9_Stage Maps/9a_Stats/TFT_9a_Stat-1.png',
            alt: 'Drain scorecard overview',
          },
          {
            src: '/img/9_Stage Maps/9a_Stats/TFT_9a_Stat-2.png',
            alt: 'Field connectivity data',
          },
          {
            src: '/img/9_Stage Maps/9a_Stats/TFT_9a_Stat-3.png',
            alt: 'Acreage coverage statistics',
          },
          {
            src: '/img/9_Stage Maps/9a_Stats/TFT_9a_Stat-4.png',
            alt: 'Phosphorus reduction metrics',
          },
          {
            src: '/img/9_Stage Maps/9a_Stats/TFT_9a_Stat-5.png',
            alt: 'Nitrogen reduction analysis',
          },
          {
            src: '/img/9_Stage Maps/9a_Stats/TFT_9a_Stat-6.png',
            alt: 'Upgrade impact summary',
          },
        ],
        sections: [
          {
            body: `
          <p>Each drain comes with a scorecard of information. In this example, this drain connects to 369 upgradable fields covering 10,000 acres.</p>
          <p>The total amount of phosphorus and nitrogen reduced is also calculated.</p>
          <p>Field upgrades connected to this single drain move us 20% closer to <strong>our goal of restoring 50,000 high-impact acres.</strong></p>
        `,
          },
        ],
      },
      {
        media: {
          src: '/img/9_Stage Maps/TFT-Map_9b_3_2-with-Fields.png',
          alt: 'Strategic drainage analysis showing multiple high-priority drains',
        },
        marker: [
          { shape: 'circle', x: 38, y: 38 },
          { shape: 'circle', x: 69, y: 64 },
        ],
        stats: [
          {
            src: '/img/9_Stage Maps/9b_Stats/TFT-Map_9b_Stat-1.png',
            alt: 'Strategic priority drainage analysis',
          },
          {
            src: '/img/9_Stage Maps/9b_Stats/TFT-Map_9b_Stat-2.png',
            alt: 'High-impact field identification',
          },
          {
            src: '/img/9_Stage Maps/9b_Stats/TFT-Map_9b_Stat-3.png',
            alt: 'Cost-effective upgrade pathways',
          },
          {
            src: '/img/9_Stage Maps/9b_Stats/TFT-Map_9b_Stat-4.png',
            alt: 'Basin-wide runoff reduction projections',
          },
          {
            src: '/img/9_Stage Maps/9b_Stats/TFT-Map_9b_Stat-5.png',
            alt: 'Implementation timeline and milestones',
          },
          {
            src: '/img/9_Stage Maps/9b_Stats/TFT-Map_9b_Stat-6.png',
            alt: 'Long-term sustainability metrics',
          },
        ],
        sections: [
          {
            body: `
          <p>Focusing on a few high-priority drains and upgrading irrigation across those fields allows water users to <strong>reduce the majority of the basin's excess runoff in a strategic, cost-effective way.</strong></p>
        `,
          },
        ],
      },
    ],
  },
};
