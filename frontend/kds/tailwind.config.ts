export default {
  content: {
    files: ['./src/**/*.{ts,tsx}', './index.html'],
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0F1014', 2: '#181A21' },
        surface: { DEFAULT: '#1F222B', 2: '#262A35' },
        ink: { DEFAULT: '#F4F1EA', 2: '#C8C2B8', 3: '#8A847B', 4: '#5A554E' },
        coral: { DEFAULT: '#F26B53', 600: '#E94B33', 700: '#C93820' },
        mint: { DEFAULT: '#5BD4B0', 600: '#4FA88E' },
        sun: { DEFAULT: '#F5C04A' },
        danger: { DEFAULT: '#FF5C42' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '22px',
      },
    },
  },
  plugins: [],
};
