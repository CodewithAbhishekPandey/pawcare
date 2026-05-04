/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paw-teal': '#0f4c5c',
        'paw-yellow': '#fbbf24',
        'paw-orange': '#ea580c',
        'paw-pink': '#fbcfe8',
        'paw-green': '#c8e6c9',
        'paw-cream': '#fdfbf7',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
