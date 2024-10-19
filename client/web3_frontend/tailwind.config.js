/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customYellow: '#f8dc75',
        customYellow2: '#F4B92B',
        customYellow3: '#FCF1C9',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],

}

