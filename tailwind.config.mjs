/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          100: '#1A1A1A',
          200: '#2A2A2A',
          300: '#3A3A3A',
          400: '#4A4A4A',
          500: '#5A5A5A',
          600: '#6A6A6A',
          700: '#7A7A7A',
          800: '#8A8A8A',
          900: '#9A9A9A',
        },
      },
      animation: {
        'ken-burns': 'ken-burns 15s ease-in-out infinite alternate',
      },
      keyframes: {
        'ken-burns': {
            'from': { transform: 'scale(1) translateY(var(--tw-translate-y, 0))' },
            'to': { transform: 'scale(1.15) translate(1%, 1%) translateY(var(--tw-translate-y, 0))' },
        },
      },
    },
  },
  plugins: [],
}