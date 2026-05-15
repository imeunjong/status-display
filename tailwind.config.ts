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
          1: '#1d1d1f',
          2: '#6e6e73',
          3: '#a1a1a6',
          4: '#d2d2d7',
        },
        surface: {
          DEFAULT: '#ffffff',
          1: '#fbfbfd',
          2: '#f5f5f7',
          3: '#ececef',
        },
        line: 'rgba(0,0,0,0.08)',
      },
      letterSpacing: {
        ios: '-0.018em',
        iostight: '-0.026em',
      },
      borderRadius: {
        '4xl': '28px',
        '5xl': '36px',
      },
      animation: {
        'fade-in': 'fadeIn 280ms cubic-bezier(0.22, 1, 0.36, 1)',
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
