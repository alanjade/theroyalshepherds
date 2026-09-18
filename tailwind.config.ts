import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: "#0B1F4D",
          50: "#EEF1F8",
          100: "#D6DEEF",
          200: "#AEBEDE",
          300: "#869DCE",
          400: "#4E6BAE",
          500: "#1E3A8A",
          600: "#17306F",
          700: "#122554",
          800: "#0B1F4D",
          900: "#070F27",
        },
        gold: {
          DEFAULT: "#C6A15B",
          50: "#FBF6EC",
          100: "#F3E6C6",
          200: "#E7CD8E",
          300: "#DAB565",
          400: "#C6A15B",
          500: "#AE8641",
          600: "#8C6A33",
          700: "#6A4F26",
        },
        charcoal: "#1B1F27",
        ink: "#111318",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 4px 24px -6px rgba(11,31,77,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
