/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rugby-green': '#16a34a',
        'rugby-black': '#1f2937',
        'sullivan-green': '#16a34a',
        'sullivan-black': '#1f2937',
      },
      fontFamily: {
        'rugby': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}