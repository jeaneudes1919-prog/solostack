/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff', // Très clair (fond)
          100: '#e0f2fe',
          400: '#38bdf8', // Bleu Ciel vibrant
          500: '#0ea5e9', // Bleu Ciel principal (Sky Blue)
          600: '#0284c7', // Survol
          900: '#0c4a6e', // Texte foncé
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Police propre et moderne
      }
    },
  },
  plugins: [],
}