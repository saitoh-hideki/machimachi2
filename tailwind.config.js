/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'shop-primary': '#8B4513',
        'shop-secondary': '#DEB887',
        'sky-day': '#f5f5f7',
        'sky-night': '#191970',
        'arcade-red': '#DC143C',
      },
      fontFamily: {
        'handwritten': ['Comic Sans MS', 'cursive'],
      },
      animation: {
        'car-up': 'carUp 20s linear infinite',
        'car-down': 'carDown 20s linear infinite',
        'clock-hour': 'clockHour 43200s linear infinite',
        'clock-minute': 'clockMinute 3600s linear infinite',
      },
      keyframes: {
        carUp: {
          '0%': { transform: 'translateY(100vh)' },
          '100%': { transform: 'translateY(-200px)' },
        },
        carDown: {
          '0%': { transform: 'translateY(-200px)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        clockHour: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        clockMinute: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}