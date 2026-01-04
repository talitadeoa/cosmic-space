import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        space: {
          dark: '#050816',
          medium: '#0b1120',
          light: '#1e293b',
        },
      },
      backgroundImage: {
        'cosmic-gradient':
          'radial-gradient(circle at top, rgba(129, 140, 248, 0.35), transparent 55%), radial-gradient(circle at bottom, rgba(236, 72, 153, 0.35), transparent 55%)',
      },
      animation: {
        'float-slow': 'float 10s ease-in-out infinite',
        'float-medium': 'float 8s ease-in-out infinite',
        'float-fast': 'float 6s ease-in-out infinite',
        'month-enter': 'month-enter 240ms ease',
        'spin-slow': 'spin 16s linear infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'orbit-slow': 'orbit 14s linear infinite',
        'orbit-medium': 'orbit 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'month-enter': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(40px) rotate(0deg)' },
          '100%': {
            transform: 'rotate(360deg) translateX(40px) rotate(-360deg)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
