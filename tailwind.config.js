/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F4DF',
        primary: '#0013FF',
        accent: '#FC5C04',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      fontWeight: {
        medium: 500,
        black: 900,
      },
    },
  },
  plugins: [],
};