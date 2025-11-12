/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        framez: {
          primary: '#6C63FF',
          secondary: '#FF6584',
          muted: '#9CA3AF',
        },
        surface: {
          light: '#FFFFFF',
          subtle: '#F9FAFB',
          dark: '#1F2937',
          'dark-elevated': '#374151',
        },
        content: {
          strong: '#111827',
          subtle: '#6B7280',
          inverted: '#F9FAFB',
        },
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};