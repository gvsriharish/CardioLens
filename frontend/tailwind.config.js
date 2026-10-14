/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          darkest: '#070b14',
          dark: '#0c1322',
          surface: '#111b2e',
          card: '#162238',
          border: '#1e3052',
          accent: '#0ea5e9',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          cyan: '#06b6d4',
          textMuted: '#94a3b8',
          textLight: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.25)',
        'glow-danger': '0 0 25px rgba(239, 68, 68, 0.3)',
        'glow-warning': '0 0 25px rgba(245, 158, 11, 0.25)',
        'glow-success': '0 0 25px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
