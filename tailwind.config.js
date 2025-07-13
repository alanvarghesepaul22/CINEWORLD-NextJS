/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navbg: "#141414",
        grey: "#1f1f1f",
        primary: "#facc15",  // yellow-400
        "light-white": "#e5e5e5",
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
