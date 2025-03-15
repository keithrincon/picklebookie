module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Include all JS/JSX/TS/TSX files in the src folder
    './public/index.html', // Include your HTML file
  ],
  theme: {
    extend: {}, // Extend Tailwind's default theme if needed
  },
  plugins: [], // Add Tailwind plugins if needed
};
