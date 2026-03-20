/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f2',
          100: '#d9ede0',
          200: '#b3dbc2',
          300: '#80c19e',
          400: '#4da37a',
          500: '#2e875e',
          600: '#1e6b4a',
          700: '#175239',
          800: '#12402c',
          900: '#0d3022',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        cream: '#faf6f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Sans Telugu"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
