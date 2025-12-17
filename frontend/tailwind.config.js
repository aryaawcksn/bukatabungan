export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(3deg)" },
          "50%": { transform: "translateY(-12px) rotate(4deg)" },
        },
        floatFast: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        sway: {
          "0%, 100%": { transform: "translateX(0px)" },
          "50%": { transform: "translateX(10px)" },
        },
        // Mobile-optimized animations
        mobileFadeIn: {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
        mobileSlideUp: {
          "from": { opacity: "0", transform: "translateY(16px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "float-fast": "floatFast 4s ease-in-out infinite",
        "sway": "sway 5s ease-in-out infinite",
        "mobile-fade-in": "mobileFadeIn 0.3s ease-out",
        "mobile-slide-up": "mobileSlideUp 0.4s ease-out",
      },
      // Mobile-specific utilities
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};
