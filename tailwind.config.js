/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        // Keep 'display' alias pointing to same sans font
        display: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        // Semantic CSS-variable-backed colors for Tailwind utilities
        ink: {
          950: '#0A0A0F', 900: '#111118', 800: '#1A1A24',
          700: '#242432', 600: '#32324A', 500: '#4A4A6A',
          400: '#6B6B8F', 300: '#9494AF', 200: '#C4C4D4',
          100: '#E8E8F0', 50:  '#F4F4F8',
        },
        gold: {
          600: '#7A5C10', 500: '#9E7A18', 400: '#B8891A',
          300: '#D4A829', 200: '#F2D97A', 100: '#FBF5E0',
        },
        teal: {
          600: '#0F6E56', 500: '#148585', 400: '#1FA8A8',
          300: '#7ACECE', 100: '#E8F6F6',
        },
        coral: {
          600: '#993C1D', 500: '#D4472E', 400: '#E8705A',
          300: '#F2A898', 100: '#FDF0ED',
        },
        sage: {
          600: '#3A6338', 500: '#4E7D4C', 400: '#6FA06C',
          300: '#A8CBA6', 100: '#EEF6ED',
        },
      },
    },
  },
  plugins: [],
}
