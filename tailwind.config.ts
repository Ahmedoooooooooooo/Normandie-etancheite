import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1e3a5f',
          orange: '#f97316',
        },
        sage: {
          DEFAULT: '#7BA89B',
          50: '#eef4f2',
          700: '#5e8b7e',
        },
      },
    },
  },
  plugins: [],
}
export default config
