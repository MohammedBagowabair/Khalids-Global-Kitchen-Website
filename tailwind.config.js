/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        char: { DEFAULT: '#17110E', 2: '#221915', 3: '#30241D' },
        cream: { DEFAULT: '#F7EEDD', 2: '#EFE2CA' },
        saffron: { DEFAULT: '#E9A93B', ink: '#8A560A' },
        pom: { DEFAULT: '#A3312A', glow: '#E0695C' },
        mint: '#7FD1A8',
        muted: { DEFAULT: '#6A584B', dark: '#BFAE98' },
      },
      fontFamily: {
        display: ['"Reem Kufi"', 'system-ui', 'sans-serif'],
        sans: ['Karla', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
