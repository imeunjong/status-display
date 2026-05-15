import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          '"Apple SD Gothic Neo"',
          'sans-serif',
        ],
      },
      colors: {
        ink: {
          1: '#ffffff',
          2: 'rgba(235,235,245,0.6)',
          3: 'rgba(235,235,245,0.3)',
          4: 'rgba(235,235,245,0.18)',
        },
        accent: {
          DEFAULT: '#ff375f',
          soft: 'rgba(255,55,95,0.16)',
        },
      },
      letterSpacing: {
        ios: '-0.012em',
        iostight: '-0.022em',
      },
      borderRadius: {
        '4xl': '28px',
        '5xl': '36px',
      },
      animation: {
        'fade-in': 'fadeIn 240ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
