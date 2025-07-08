/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2f6',
          100: '#d4dfe9',
          200: '#b9ccdc',
          300: '#9eb8cf',
          400: '#83a5c2',
          500: '#6891b5',
          600: '#30475e', // Main primary color
          700: '#263a4b',
          800: '#1c2c39',
          900: '#131d26',
        },
        secondary: {
          50: '#fef4eb',
          100: '#fde4ce',
          200: '#fbd4b0',
          300: '#f9c493',
          400: '#f7b475',
          500: '#f2a365', // Accent color
          600: '#c28251',
          700: '#91623d',
          800: '#614129',
          900: '#302114',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Cinzel', 'serif'],
        display: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'grain': "url('/src/assets/textures/grain.png')",
        'paper': "url('/src/assets/textures/paper.png')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
