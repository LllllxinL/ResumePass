/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        status: {
          applied: '#6b7280',
          screening: '#f59e0b',
          read: '#3b82f6',
          rejected: '#ef4444',
          interview: '#8b5cf6',
          offer: '#10b981',
          accepted: '#059669',
          declined: '#6b7280',
        }
      },
    },
  },
  plugins: [],
}
