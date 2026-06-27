/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#6366f1', hover: '#4f46e5' },
      },
      boxShadow: {
        soft: '0 2px 20px -2px rgba(0,0,0,0.06), 0 1px 4px -1px rgba(0,0,0,0.04)',
        'soft-lg': '0 8px 40px -8px rgba(0,0,0,0.10), 0 2px 8px -2px rgba(0,0,0,0.06)',
        indigo: '0 8px 24px -4px rgba(99,102,241,0.30)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}
