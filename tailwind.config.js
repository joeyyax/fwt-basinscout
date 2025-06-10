/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Custom typography configuration leveraging v4.1 features
      fontSize: {
        'prose-h3': ['2rem', { lineHeight: '1.2' }],
        'prose-p': ['1.125rem', { lineHeight: '1.6' }],
        'prose-h3-lg': ['2.25rem', { lineHeight: '1.2' }],
        'prose-p-lg': ['1.25rem', { lineHeight: '1.6' }],
        'title-sm': ['5rem', { lineHeight: '0.9' }],
        'title-md': ['6rem', { lineHeight: '0.9' }],
        'title-lg': ['7rem', { lineHeight: '0.9' }],
      },
      // Custom animation curves for GSAP compatibility
      transitionTimingFunction: {
        'gsap-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'gsap-power2': 'cubic-bezier(0.64, 0, 0.78, 0)',
        'gsap-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
      // Enhanced color palette for animations
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  // Tailwind CSS v4.1 - no plugins needed for container queries
  plugins: [],
};
