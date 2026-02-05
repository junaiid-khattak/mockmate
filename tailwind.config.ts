import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      backgroundImage: {
        "grid-slate": "radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
