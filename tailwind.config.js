/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-bg-primary': '#0E141B',
        'brand-bg-secondary': '#1C232C',
        'brand-accent-primary': '#2E8BFF',
        'brand-accent-secondary': '#FFB84D',
        'brand-highlight': '#3DDC97',
        'brand-error': '#FF5C5C',
        'brand-text-primary': '#E9EDF2',
        'brand-text-secondary': '#A0A8B0',
        'brand-border': '#2A313A',
      }
    },
  },
  plugins: [],
}
