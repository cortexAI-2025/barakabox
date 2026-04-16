/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // BarakaBox brand palette (logo: "Mange mieux. Paye moins. Sauve plus.")
        baraka: {
          50:  '#f0f9f3',
          100: '#d8f0e0',
          200: '#b2e0c2',
          300: '#7ecba0',
          400: '#4aaf7a',
          500: '#236B40',
          600: '#1A5C35',  // primary — BARAKA green
          700: '#144828',
          800: '#0F3A21',  // dark
          900: '#0a2416',
        },
        gold: {
          50:  '#fffdf0',
          100: '#fef8d0',
          200: '#fdf0a0',
          300: '#fce46a',
          400: '#F9C532',  // secondary — BOX gold
          500: '#D4A020',  // dark gold
          600: '#b88a18',
          700: '#8a6510',
          800: '#5c4208',
          900: '#2e2104',
        },
      },
    },
  },
  plugins: [],
};
