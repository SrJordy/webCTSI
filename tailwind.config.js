/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-red': '#F4B4B4', // Rojo pastel
        'pastel-white': '#F7F7F7', // Blanco pastel
        'med-blue': '#A7C4BC', // Azul suave
      }
    },
  },
  plugins: [],
}
