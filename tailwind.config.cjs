/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        electric: "#3b82f6",
        "electric-dark": "#2563eb",
        emerald: {
          400: "#34d399",
          500: "#10b981",
        },
      },
      blur: {
        glass: "12px",
        "glass-heavy": "24px",
      },
      backdropBlur: {
        glass: "12px",
        "glass-heavy": "24px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
        "glass-inner": "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
        "glass-glow": "0 0 20px rgba(59, 130, 246, 0.3)",
        "glass-glow-strong": "0 0 40px rgba(59, 130, 246, 0.4)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.2s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.3", filter: "blur(20px)" },
          "50%": { opacity: "0.5", filter: "blur(30px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
