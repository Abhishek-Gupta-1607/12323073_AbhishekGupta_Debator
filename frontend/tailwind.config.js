/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink': '#0f172a',
        'paper': '#f8fafc',
        'gold': '#d4af37',
        'for': '#3b82f6',
        'against': '#ef4444',
      }
    },
  },
  plugins: [],
}
