const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        enter: "enter 200ms ease-out forwards",
        leave: "leave 150ms ease-in forwards",
      },
      keyframes: {
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
      },
      transitionProperty: {
        height: "height",
      },
      fontFamily: {
        sans: ["Rubik", ...defaultTheme.fontFamily.sans],
      },

      spacing: {
        0.25: "0.0625rem",
        120: "30rem",
        160: "40rem",
        200: "50rem",
        240: "45rem",
      },
      fontSize: {
        heading1: "3.375rem",
        heading2: "2.75rem",
        heading3: "2.25rem",
        heading4: "1.5rem",
        subheading1: "1.25rem",
        subheading2: "1.125rem",
        body1: "1rem",
        body2: "0.875rem",
        body3: "0.75rem",
        body4: "0.625rem",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    colors: {
      transparent: {
        DEFAULT: "transparent",
      },
      white: {
        DEFAULT: "#fff",
      },
      black: {
        DEFAULT: "#000",
      },
      gray: {
        DEFAULT: "#A5A7A7",
        50: "#FAFAFB",
        100: "#EFF0F0",
        200: "#DBDDDC",
        300: "#C6C8C8",
        400: "#B1B5B3",
        500: "#9CA19F",
        600: "#878D8B",
        700: "#737977",
        800: "#5F6462",
        900: "#444746",
      },
      green: {
        50: "#E0E5E1",
        100: "#D5DCD6",
        200: "#BFC9C1",
        300: "#AAB7AC",
        400: "#94A497",
        500: "#809280",
        600: "#6B7D6D",
        700: "#505E52",
        800: "#364038",
        900: "#1C211C",
      },
      olive: {
        50: "#F5F5F3",
        100: "#ECECE8",
        200: "#D4D5CD",
        300: "#BCBEB1",
        400: "#A4A796",
        500: "#8B907A",
        600: "#707562",
        700: "#54594A",
        800: "#393D33",
        900: "#1F211C",
      },
      lime: {
        50: "#FDFEF9",
        100: "#F9FAEB",
        200: "#F1F3CB",
        300: "#E5E9A2",
        400: "#D8DF7B",
        500: "#CDD559",
        600: "#ACB344",
        700: "#7F8532",
        800: "#535720",
        900: "#27290E",
      },
    },
  },
};
