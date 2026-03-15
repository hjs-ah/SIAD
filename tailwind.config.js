/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0A0A0F',
          900: '#111118',
          800: '#1A1A24',
          700: '#242432',
          600: '#32324A',
          500: '#4A4A6A',
          400: '#6B6B8F',
          300: '#9494AF',
          200: '#C4C4D4',
          100: '#E8E8F0',
          50:  '#F4F4F8',
        },
        gold: {
          600: '#8B6914',
          500: '#B8891A',
          400: '#D4A829',
          300: '#E8C547',
          200: '#F2D97A',
          100: '#FAF0C8',
        },
        teal: {
          600: '#0D5C5C',
          500: '#0F7070',
          400: '#148585',
          300: '#1FA8A8',
          200: '#7ACECE',
          100: '#D0F0F0',
        },
        coral: {
          600: '#8B2A1A',
          500: '#B83420',
          400: '#D4472E',
          300: '#E8705A',
          200: '#F2A898',
          100: '#FAE4DF',
        },
        sage: {
          600: '#2A4A2A',
          500: '#3A6338',
          400: '#4E7D4C',
          300: '#6FA06C',
          200: '#A8CBA6',
          100: '#DFF0DE',
        },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
