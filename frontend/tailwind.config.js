/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#05070A',
        surface: '#0B1016',
        elevated: '#111820',
        primary: {
          DEFAULT: '#B8FF3D',
          hover: '#a5ee28',
          glow: 'rgba(184, 255, 61, 0.25)',
        },
        muted: '#7D8792',
        critical: {
          DEFAULT: '#FF4D67',
          glow: 'rgba(255, 77, 103, 0.25)',
        },
        warning: {
          DEFAULT: '#FFC857',
          glow: 'rgba(255, 200, 87, 0.25)',
        },
        success: {
          DEFAULT: '#35E0A1',
          glow: 'rgba(53, 224, 161, 0.25)',
        },
        info: {
          DEFAULT: '#55B8FF',
          glow: 'rgba(85, 184, 255, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(184, 255, 61, 0.3)',
        'glow-critical': '0 0 25px -5px rgba(255, 77, 103, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}
