// tailwind.config.js
module.exports = {
  theme: {
    extend: {
  keyframes: {
    floating: {
      '0%, 100%': { transform: 'translate(0, 0)' },
      '50%': { transform: 'translate(20px, -20px)' },
      'pulse-slow': 'pulse 3s ease-in-out infinite'
      
    },
    gradientShift: {
      '0%, 100%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
    },
  },
  animation: {
    floating: 'floating 12s ease-in-out infinite',
    'floating-slow': 'floating 20s ease-in-out infinite',
    'floating-reverse': 'floating 18s ease-in-out infinite reverse',
    gradientShift: 'gradientShift 8s ease infinite',
  },
},
  },
  plugins: [],
};
