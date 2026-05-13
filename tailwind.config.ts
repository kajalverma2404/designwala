import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: "#FF9933",
          50: "#FFF3E0",
          100: "#FFE0B2",
          200: "#FFCC80",
          300: "#FFB74D",
          400: "#FFA726",
          500: "#FF9933",
          600: "#FB8C00",
          700: "#F57C00",
          800: "#EF6C00",
          900: "#E65100",
        },
        teal: {
          DEFAULT: "#006D77",
          50: "#E0F2F1",
          100: "#B2DFDB",
          200: "#80CBC4",
          300: "#4DB6AC",
          400: "#26A69A",
          500: "#006D77",
          600: "#00635A",
          700: "#004D40",
          800: "#003D33",
          900: "#002E28",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-soft": "pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
