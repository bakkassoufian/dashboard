/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'odc-orange': '#FF7900',
        'odc-black': '#000000',
        'odc-gray': '#1a1a1a',
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: { odc: '4px' },
    },
  },
  plugins: [],
};
