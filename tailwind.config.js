/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#033319',
          50: '#e6f0eb',
          100: '#cce1d7',
          200: '#99c3af',
          300: '#66a587',
          400: '#33875f',
          500: '#033319',
          600: '#022914',
          700: '#021f0f',
          800: '#01140a',
          900: '#000a05',
        }
      }
    },
  },
  plugins: [],
};