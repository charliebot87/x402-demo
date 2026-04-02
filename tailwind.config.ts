import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: '#00ff41',
          cyan: '#00d4ff',
          dim: '#4a9f4a',
          bg: '#0a0a0a',
          card: '#111111',
          border: '#1a1a1a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
export default config
