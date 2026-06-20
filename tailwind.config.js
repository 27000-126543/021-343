/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      colors: {
        status: {
          'not-started': '#6B7280',
          'drilling': '#3B82F6',
          'pending-pour': '#F59E0B',
          'completed': '#10B981',
          'pending-test': '#8B5CF6',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-risk': 'pulseRisk 2s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
