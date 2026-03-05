/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      colors: {
        sage: {
          50:  '#f4f7f5',
          100: '#e6eeea',
          200: '#ceded6',
          300: '#aac6b6',
          400: '#7cae9e',
          500: '#568f80',
          600: '#437268',
          700: '#385c55',
          800: '#2f4a45',
          900: '#293e3a',
        },
        cream: {
          50:  '#fdfcf9',
          100: '#f8f5f0',
          200: '#ede8df',
          300: '#ddd5c8',
          400: '#c9bda9',
          500: '#b5a48e',
        },
        warm: {
          50:  '#fef9f5',
          100: '#fdf0e6',
          200: '#fad9bc',
          300: '#f5b98a',
          400: '#ed9155',
          500: '#e47030',
          600: '#c45820',
          700: '#a04318',
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float':      'float 5s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      spacing: {
        '13': '3.25rem',
        '18': '4.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}