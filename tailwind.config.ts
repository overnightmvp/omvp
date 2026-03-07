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
        bg: {
          primary: '#0A0A0A',
          secondary: '#1A1A1A',
          tertiary: '#2A2A2A',
        },
        txt: {
          primary: '#F5F5F5',
          secondary: '#A0A0A0',
          mid: '#D0D0D0',
        },
        accent: '#E8FF47',
        accent2: '#FF3B5C',
        accent3: '#4DFFA4',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        serif: ['var(--font-instrument-serif)'],
        mono: ['var(--font-geist-mono)'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
export default config
