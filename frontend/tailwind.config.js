module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Include all JS/JSX/TS/TSX files in the src folder
    './public/index.html', // Include your HTML file
  ],
  theme: {
    extend: {
      colors: {
        'pickle-green': '#4CAF50',
        'pickle-green-dark': '#388E3C',
        'pickle-green-light': '#A5D6A7',
        'court-blue': '#2196F3',
        'court-blue-dark': '#1976D2',
        'court-blue-light': '#BBDEFB',
        'ball-yellow': '#FFC107',
        'ball-yellow-light': '#FFECB3',
        white: '#FFFFFF',
        'off-white': '#F5F5F5',
        'light-gray': '#E0E0E0',
        'medium-gray': '#9E9E9E',
        'dark-gray': '#616161',
        black: '#212121',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
      },
    },
  },
  plugins: [], // Add Tailwind plugins if needed
};
