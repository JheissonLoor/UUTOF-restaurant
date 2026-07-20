import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF6F0',
        bg2: '#F4ECE0',
        surface: '#FFFFFF',
        ink: '#1F1A14',
        ink2: '#3A322A',
        ink3: '#6B6056',
        ink4: '#9B9189',
        coral: '#E94B33',
        'coral-dark': '#C93820',
        mint: '#5BB39A',
        'mint-dark': '#3A8A72',
        sun: '#E8B14A',
        'sun-dark': '#B07E1E',
        plum: '#8C6BA1',
        'plum-dark': '#6E4F84',
        sky: '#6B8FA8',
        'sky-dark': '#4A6F88',
        danger: '#B44A3B',
        sidebar: '#17130E',
        'sidebar-soft': '#201A13',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 8px 28px rgba(45, 35, 25, 0.08)',
        lift: '0 14px 34px rgba(45, 35, 25, 0.12)',
      },
      borderRadius: {
        card: '8px',
      },
      keyframes: {
        'view-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'view-in': 'view-in 180ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
