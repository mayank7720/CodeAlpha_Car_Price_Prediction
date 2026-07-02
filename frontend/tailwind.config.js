/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core design system tokens matching ui-ux-pro-max guidelines
        slate: {
          950: '#0b0f19', // Default background
          900: '#151c2c', // Card background
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
