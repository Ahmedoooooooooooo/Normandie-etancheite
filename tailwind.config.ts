import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
        },
        orange: {
          500: "#f97316",
          600: "#ea6c0a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
