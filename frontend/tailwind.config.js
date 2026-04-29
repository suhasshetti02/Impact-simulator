/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          900: "#080c14",
          800: "#0d1526",
          700: "#111f38",
          600: "#1a2d4f",
        },
        violet:  "#6c63ff",
        cyan:    "#00d4ff",
        emerald: "#00e5a0",
        amber:   "#ffb547",
        rose:    "#ff5c7f",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "22px",
      },
      backdropBlur: {
        xs: "4px",
      },
      backgroundImage: {
        "grad-primary":  "linear-gradient(135deg, #6c63ff 0%, #00d4ff 100%)",
        "grad-success":  "linear-gradient(135deg, #00e5a0 0%, #00d4ff 100%)",
        "grad-page":     "radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.10) 0%, transparent 60%), #080c14",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-12px)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease forwards",
        "float":     "float 4s ease-in-out infinite",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
        "spin-slow": "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};
