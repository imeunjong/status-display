import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        card: '#161616',
        line: '#262626',
        accent: '#ff5a8a',
      },
    },
  },
  plugins: [],
};

export default config;
