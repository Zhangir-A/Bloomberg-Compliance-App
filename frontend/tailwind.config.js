/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a7a4a',
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
};
