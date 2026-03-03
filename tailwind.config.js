/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        sage: {
          50: '#f4f7f5',
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
          50: '#fdfcf9',
          100: '#f8f5f0',
          200: '#ede8df',
          300: '#ddd5c8',
          400: '#c9bda9',
          500: '#b5a48e',
        },
        warm: {
          50: '#fef9f5',
          100: '#fdf0e6',
          200: '#fad9bc',
          300: '#f5b98a',
          400: '#ed9155',
          500: '#e47030',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-right': 'slideRight 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
