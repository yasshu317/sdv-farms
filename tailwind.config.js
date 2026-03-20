/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paddy: {
          50:  '#f0f7f1',
          100: '#d9edda',
          200: '#b4dab7',
          300: '#84c188',
          400: '#54a459',
          500: '#378a3d',
          600: '#286d2f',
          700: '#205727',
          800: '#1a4520',
          900: '#0e2c13',
          950: '#071709',
        },
        turmeric: {
          50:  '#fefdf0',
          100: '#fdf8cc',
          200: '#faed95',
          300: '#f6de55',
          400: '#f1c929',
          500: '#d4a017',
          600: '#b87c10',
          700: '#9a5d0f',
          800: '#7e4813',
          900: '#6b3b13',
        },
        terracotta: {
          50:  '#fef4f0',
          100: '#fee6db',
          200: '#fdc9b5',
          300: '#faa385',
          400: '#f5714d',
          500: '#e04a27',
          600: '#c1380e',
          700: '#a12e0c',
          800: '#852811',
          900: '#6e2413',
        },
        marigold: {
          400: '#ff9f1c',
          500: '#e8870a',
          600: '#c97108',
        },
        cream:  '#fdf8f0',
        linen:  '#faf3e0',
        soil:   '#5c3a1e',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Sans Telugu"', 'sans-serif'],
      },
      backgroundImage: {
        'leaf-pattern': "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 8 Q52 24 40 36 Q28 24 40 8Z' fill='%23378a3d' opacity='0.07'/%3E%3Cpath d='M72 40 Q56 52 40 40 Q56 28 72 40Z' fill='%23378a3d' opacity='0.07'/%3E%3Cpath d='M8 40 Q24 52 40 40 Q24 28 8 40Z' fill='%23378a3d' opacity='0.07'/%3E%3Cpath d='M40 72 Q52 56 40 40 Q28 56 40 72Z' fill='%23378a3d' opacity='0.07'/%3E%3C/svg%3E\")",
        'dot-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23d4a017' opacity='0.15'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
