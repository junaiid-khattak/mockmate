import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        "mm-bg": "#08080C",
        "mm-text": "#F0F0F5",
        "mm-muted": "#8B8B9E",
        "mm-dim": "#55556A",
        "mm-violet": "#7C5CFC",
        "mm-blue": "#3B82F6",
        "mm-cyan": "#06B6D4",
        "mm-emerald": "#34D399",
        "mm-amber": "#FBBF24",
      },
      backgroundImage: {
        "gradient-accent":
          "linear-gradient(135deg, #7C5CFC 0%, #3B82F6 50%, #06B6D4 100%)",
        "gradient-cta": "linear-gradient(135deg, #7C5CFC 0%, #3B82F6 100%)",
        "gradient-radial":
          "radial-gradient(circle at 50% 0%, rgba(124, 92, 252, 0.08) 0%, transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
