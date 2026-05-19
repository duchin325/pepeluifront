/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E8FAFA',
          100: '#C0F0F0',
          200: '#7FDEDE',
          300: '#3DCFCF',
          400: '#1BBABA',
          500: '#0F9E9E',
          600: '#0A7E7E',
          700: '#075E5E',
          800: '#043E3E',
          900: '#021F1F',
        },
        gold: {
          50:  '#FFFBEA',
          100: '#FEF2B8',
          200: '#FDE472',
          300: '#F5C842',
          400: '#E8B020',
          500: '#C98F0E',
          600: '#9E6D08',
          700: '#724D05',
          800: '#463003',
          900: '#1A1101',
        },
        cream: '#F0FAFA',
        charcoal: '#0D2B2B',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'count-bump': {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in':   'slide-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':    'fade-in 0.4s ease both',
        'scale-in':   'scale-in 0.2s ease both',
        'count-bump': 'count-bump 0.25s ease',
        'slide-up':   'slide-up 0.35s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
}
