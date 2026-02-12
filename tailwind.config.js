/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e07e27',
          hover: '#cc7324',
        },
        dark: {
          bg: '#0B0D10',
          header: '#413c38',
          'header-top': '#332f2c',
        },
        text: {
          dark: '#333333',
          light: '#777777',
          white: '#ffffff',
        },
        bg: {
          white: '#ffffff',
          light: '#fafafa',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        heading: ['Raleway', 'sans-serif'],
        logo: ['Pacifico', 'cursive'],
      },
    },
  },
  plugins: [],
}
