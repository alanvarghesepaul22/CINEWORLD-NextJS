/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "bg-black": "#0E0E0E",
        primary: "#FDE402",
        "light-primary": "#A69C40",
        white: "#ffffff",
        grey: "#1D1B1B",
        "light-white": "#6D6B6B",
        navbg: "rgb(8, 8, 8)",
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
