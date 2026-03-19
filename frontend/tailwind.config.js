/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: { 0: '#04080F', 1: '#080E1A', 2: '#0C1424', 3: '#101D30', 4: '#152236' },
        bdr: { 1: '#162035', 2: '#1E2E48' },
        teal: { DEFAULT: '#00C896', bg: 'rgba(0,200,150,0.08)' },
        blue: { DEFAULT: '#3B82F6' },
        amber: { DEFAULT: '#F59E0B' },
        red: { DEFAULT: '#EF4444' },
        green: { DEFAULT: '#22C55E' },
        violet: { DEFAULT: '#8B5CF6' },
        txt: { 1: '#F0F6FF', 2: '#8899AA', 3: '#4A5F7A' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
