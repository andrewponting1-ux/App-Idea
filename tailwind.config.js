/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        game: {
          bg:     '#100d05',
          card:   '#1e1508',
          border: '#6b4f1a',
          purple: '#7c3aed',
          gold:   '#f5a623',
          teal:   '#0d9488',
          pink:   '#ec4899',
          red:    '#ef4444',
          green:  '#22c55e',
          blue:   '#3b82f6',
        },
        stone: {
          panel:  '#1e1508',
          light:  '#2e2010',
          border: '#6b4f1a',
        },
        gold: {
          DEFAULT: '#f5a623',
          light:   '#ffd166',
          dark:    '#a06510',
          border:  '#c8830a',
        },
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow':  'bounce 2s infinite',
        'wiggle':       'wiggle 0.5s ease-in-out infinite',
        'float':        'float 3s ease-in-out infinite',
        'glow':         'glow 2s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%':      { transform: 'rotate(5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(245,166,35,0.5)' },
          '50%':      { boxShadow: '0 0 20px rgba(245,166,35,0.9)' },
        },
      }
    },
  },
  plugins: [],
}
