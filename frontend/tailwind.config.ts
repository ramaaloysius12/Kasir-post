import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: { coffee: { 50: '#fdf8f5', 100: '#f8ede6', 500: '#8c6b5d', 800: '#4a3728', 900: '#2c2118' } },
      boxShadow: { 'soft': '0 4px 20px -2px rgba(74, 55, 40, 0.05)' }
    }
  },
  plugins: [],
}
export default config
