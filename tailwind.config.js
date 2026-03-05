/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './docs/*.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Source Sans 3', 'system-ui', 'sans-serif'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
      colors: {
        'isf-blue': {
          dark: '#1a3570',
          DEFAULT: '#2547a0',
          light: '#c8d8f4',
        },
        'isf-red': {
          dark: '#a8180f',
          DEFAULT: '#c1211f',
          light: '#f8c6c4',
        },
        'isf-gold': {
          dark: '#f5b800',
          DEFAULT: '#f9c430',
          light: '#fde68a',
        },
        'isf-green': {
          dark: '#1a5c38',
          DEFAULT: '#2d8a55',
          light: '#d9f0e4',
        },
        'isf-navy': '#1c2440',
        'isf-slate': '#6b7a99',
        'isf-tinted': '#e8edf5',
      },
    },
  },
  plugins: [],
}
