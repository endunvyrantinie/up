import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf7f2',
          100: '#f5ede0',
          200: '#ead9c1',
          300: '#ddc19a',
          400: '#cfa572',
          500: '#b8864f',
          600: '#9d6d3f',
          700: '#7f5635',
          800: '#6a4730',
          900: '#5a3d2a',
          brown: '#8B4513',
          latte: '#D2B48C',
          espresso: '#3E2723',
          milk: '#F5F5F5',
        },
      },
    },
  },
  plugins: [],
}
export default config

