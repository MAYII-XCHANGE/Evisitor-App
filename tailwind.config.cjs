/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00B0F0",
          50: "#E9F8FF",
          100: "#DFF3FF",
          200: "#BDEBFF",
          500: "#00B0F0",
          700: "#0089B0",
        },
        accent: {
          DEFAULT: "#0EA5E9",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F7FAFC",
        },
        danger: {
          DEFAULT: "#EF4444",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
      },
      boxShadow: {
        card: "0 6px 18px rgba(19, 24, 31, 0.06)",
        subtle: "0 1px 2px rgba(16,24,40,0.04)",
      },
    },
  },
  plugins: [],
};
