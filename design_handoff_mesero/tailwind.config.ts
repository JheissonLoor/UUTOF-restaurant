import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FAF6F0',
          100: '#F4ECE0',
          200: '#EADFCD',
          300: '#DCCDB3',
        },
        ink: {
          200: '#D4C9BC',
          300: '#B3A89C',
          400: '#8E8378',
          500: '#6B6056',
          700: '#3A322A',
          900: '#1F1A14',
        },
        terracotta: {
          50:  '#FDE8E2',
          100: '#FACFC2',
          200: '#F5A593',
          400: '#F26B53',
          500: '#E94B33',  // primario
          600: '#C93820',
          700: '#9C2A17',
        },
        sage: {
          50:  '#E6F4EE',
          100: '#CFEAE1',
          500: '#5BB39A',
          600: '#3A8A72',
        },
        saffron: {
          50:  '#FBF1D9',
          100: '#F5E2C0',
          500: '#D9A23B',
          600: '#8a6515',
        },
        wine: {
          100: '#F6D4CE',
          500: '#C04A3D',
        },
        sky: {
          100: '#DCE6EF',
          500: '#6B8FA8',
        },
        success: '#4F8A5B',
        warning: '#C98A1A',
        danger:  '#B44A3B',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:  ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        // tamaños custom según spec
        'display-xl': ['44px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['32px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h1':         ['24px', { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2':         ['18px', { lineHeight: '1.3',                            fontWeight: '600' }],
        'label':      ['12px', { lineHeight: '1.4',  letterSpacing: '0.06em',  fontWeight: '500' }],
      },
      borderRadius: {
        sm:  '8px',
        md:  '12px',
        lg:  '16px',
        xl:  '20px',
      },
      boxShadow: {
        'sm-soft': '0 1px 0 rgba(42,30,20,0.04), 0 1px 2px rgba(42,30,20,0.04)',
        'md-soft': '0 1px 0 rgba(42,30,20,0.04), 0 8px 24px -8px rgba(42,30,20,0.12)',
        'lg-soft': '0 2px 4px rgba(42,30,20,0.04), 0 24px 48px -16px rgba(42,30,20,0.18)',
      },
      transitionTimingFunction: {
        'pop': 'cubic-bezier(.18,.9,.32,1.18)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'count-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer:   'shimmer 1.5s linear infinite',
        'count-in':'count-in 800ms ease-out',
      },
    },
  },
  plugins: [forms],
};

export default config;
