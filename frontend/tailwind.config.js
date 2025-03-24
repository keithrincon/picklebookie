module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Existing colors
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

        // New colors for post feed components
        'practice-bg': '#E0F2FE',
        'practice-text': '#0369A1',
        'singles-bg': '#DCFCE7',
        'singles-text': '#166534',
        'doubles-bg': '#FEF3C7',
        'doubles-text': '#92400E',
        'distance-bg': '#F0FDF4',
        'distance-text': '#166534',
        'approximate-bg': '#FFFBEB',
        'approximate-text': '#92400E',
        'card-border': '#E2E8F0',
        'card-shadow': 'rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      screens: {
        xs: '480px',
        '3xl': '1920px',
      },
      spacing: {
        72: '18rem',
        84: '21rem',
        96: '24rem',
        // New spacing for cards
        'card-padding': '1rem',
      },
      borderRadius: {
        card: '0.5rem',
        badge: '0.25rem',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 6px 12px rgba(0, 0, 0, 0.15)',
      },
      fontSize: {
        badge: '0.75rem',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // New fade-in animation for cards
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        spin: 'spin 2s linear infinite',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
      },
      transitionProperty: {
        card: 'box-shadow, transform',
      },
      transitionDuration: {
        card: '200ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // New plugin for line-clamp
    require('@tailwindcss/line-clamp'),
  ],
  variants: {
    extend: {
      boxShadow: ['hover'],
      transform: ['hover'],
      opacity: ['disabled'],
    },
  },
};
