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
        bg: '#0A0A0A',
        surface: '#141414',
        card: '#1A1A1A',
        border: '#2A2A2A',
        'border-md': '#3A3A3A',
        txt: '#FFFFFF',
        'txt-mid': '#A0A0A0',
        'txt-dim': '#707070',
        accent: '#E8FF47',
        accent2: '#FF3B5C',
        accent3: '#4DFFA4',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(.22,1,.36,1)',
      },
    },
  },
  plugins: [],
}
export default config
