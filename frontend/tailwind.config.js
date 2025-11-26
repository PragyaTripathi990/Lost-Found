/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          bg: '#0a0e27',
          surface: '#111827',
          card: '#1f2937',
          border: '#374151',
          text: {
            primary: '#f9fafb',
            secondary: '#d1d5db',
            muted: '#9ca3af',
          }
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f172a 100%)',
        'gradient-card': 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
