/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#5f6b85",
        surface: "#f5f3ff",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#4361ee",
          600: "#3751d7",
          700: "#2f43b8",
        },
        violetSoft: "#6d5dfc",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(50, 59, 117, 0.12)",
        glow: "0 18px 40px rgba(67, 97, 238, 0.25)",
        elegant: "0 24px 80px rgba(31, 41, 55, 0.18)",
        card: "0 10px 30px rgba(50, 59, 117, 0.08)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in-up": "fade-in-up 0.55s ease-out both",
      },
    },
  },
  plugins: [],
};
