import { registerComponent } from '../utils/components.js';

/**
 * Header Component
 *
 * @param {Object} props
 * @param {string} [props.homeUrl] - URL for the home link
 * @param {string} [props.logoSrc] - Logo image source
 * @param {string} [props.logoAlt] - Logo alt text
 * @param {string} [props.ctaUrl] - CTA button URL
 * @param {string} [props.ctaText] - CTA button text
 */
export function Header({
  homeUrl = 'https://thefreshwatertrust.org/',
  logoSrc = 'https://thefreshwatertrust.org/assets/images/svg/logo.svg',
  logoAlt = 'The Freshwater Trust BasinScout',
  ctaUrl = 'https://connect.clickandpledge.com/w/Form/04cf997a-124d-4a8d-a79d-3b51bd8474e2?638108545147135766',
  ctaText = 'Support Our Work',
}) {
  return (
    <header className="sticky top-0 w-full z-40 pointer-events-none h-12 lg:h-20">
      <div className="container">
        <div className="pointer-events-auto flex flex-row justify-between w-full">
          <a
            className="branding h-12 lg:h-20"
            href={homeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="The Freshwater Trust BasinScout"
          >
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-8 lg:h-12 w-auto hover:opacity-80 transition-opacity duration-200"
            />
          </a>
          {ctaUrl && (
            <a className="btn btn-primary" href={ctaUrl} target="_blank">
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

// Register component for CMS export
registerComponent('Header', Header, {
  name: 'Site Header',
  fields: {
    homeUrl: {
      type: 'url',
      description: 'URL for the home/logo link',
      default: 'https://thefreshwatertrust.org/',
      required: true,
    },
    logoSrc: {
      type: 'assets',
      limit: 1,
      kinds: ['image'],
      description: 'Logo image file',
      default: 'https://thefreshwatertrust.org/assets/images/svg/logo.svg',
      required: true,
    },
    logoAlt: {
      type: 'text',
      description: 'Alt text for logo image',
      default: 'The Freshwater Trust BasinScout',
      required: true,
    },
    ctaUrl: {
      type: 'url',
      description: 'Call-to-action button URL (leave empty to hide button)',
      required: false,
    },
    ctaText: {
      type: 'text',
      description: 'Call-to-action button text',
      default: 'Support Our Work',
      required: false,
    },
  },
});
