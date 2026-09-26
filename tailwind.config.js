/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          950: '#0a0b0f',
          900: '#12141b',
          800: '#1b1e29',
          700: '#262b3a',
          accent: '#5eead4',
          warn: '#fbbf24'
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
