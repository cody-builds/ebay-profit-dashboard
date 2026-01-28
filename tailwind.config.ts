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
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  safelist: [
    // Risk level colors
    'bg-green-500/20',
    'text-green-400',
    'border-green-500/30',
    'bg-yellow-500/20',
    'text-yellow-400',
    'border-yellow-500/30',
    'bg-red-500/20',
    'text-red-400',
    'border-red-500/30',
    'bg-blue-500/20',
    'text-blue-400',
    'border-blue-500/30',
  ],
  plugins: [],
};
export default config;
