import { createTheme } from "@shopify/restyle";
import { Platform } from "react-native";

const fontWeight = (weight: string) => {
  if (Platform.OS === "ios") {
    return { fontWeight: weight };
  } else {
    return { fontFamily: "Inter-" + weight };
  }
};

const theme = createTheme({
  colors: {
    black: "#000000",
    white: "#FFFFFF",
    transparent: "transparent",

    gray50: "#FAFAFB",
    gray100: "#EFF0F0",
    gray200: "#DBDDDC",
    gray300: "#C6C8C8",
    gray400: "#B1B5B3",
    gray500: "#9CA19F",
    gray600: "#878D8B",
    gray700: "#737977",
    gray800: "#5F6462",
    gray900: "#444746",

    green50: "#E0E5E1",
    green100: "#D5DCD6",
    green200: "#BFC9C1",
    green300: "#AAB7AC",
    green400: "#94A497",
    green500: "#809280",
    green600: "#6B7D6D",
    green700: "#505E52",
    green800: "#364038",
    green900: "#1C211C",

    olive50: "#F5F5F3",
    olive100: "#ECECE8",
    olive200: "#D4D5CD",
    olive300: "#BCBEB1",
    olive400: "#A4A796",
    olive500: "#8B907A",
    olive600: "#707562",
    olive700: "#54594A",
    olive800: "#393D33",
    olive900: "#1F211C",

    lime50: "#FDFEF9",
    lime100: "#F9FAEB",
    lime200: "#F1F3CB",
    lime300: "#E5E9A2",
    lime400: "#D8DF7B",
    lime500: "#CDD559",
    lime600: "#ACB344",
    lime700: "#7F8532",
    lime800: "#535720",
    lime900: "#27290E",
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    36: 144,
    40: 160,
    48: 192,
    56: 224,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  textVariants: {
    defaults: {
      color: "gray900",
      fontFamily: "Rubik_400Regular",
    },
    heading1: {
      fontSize: 56,
    },
    heading2: {
      fontSize: 44,
    },
    heading3: {
      fontSize: 36,
    },
    heading4: {
      fontSize: 24,
    },
    subheading1: {
      fontSize: 20,
    },
    subheading2: {
      fontSize: 18,
    },
    body1: {
      fontSize: 16,
    },
    body2: {
      fontSize: 14,
    },
    body3: {
      fontSize: 12,
    },
  },
  buttonVariants: {
    primary: {
      bg: "gray900",
    },
    cta: {
      bg: "brandPrimary",
    },
    ghost: {
      bg: "gray100",
      borderColor: "gray400",
      borderWidth: 1,
    },
    ghostS: {
      height: 40,
      px: 16,
      bg: "gray100",
      borderColor: "gray400",
      borderWidth: 1,
    },
    disabled: {
      bg: "gray200",
    },
    qrCode: {
      bg: "overlayWhite10",
    },
    numkey: {
      height: null,
      borderRadius: 32,
      bg: "gray100",
      borderColor: "gray300",
      borderWidth: 1,
    },
  },
});

export type Theme = typeof theme;
export default theme;

export const themeButtonText = {
  primary: {
    textVariant: "buttonM",
    color: "gray100",
  },
  cta: {
    textVariant: "buttonM",
    color: "gray100",
  },
  ghost: {
    textVariant: "buttonM",
    color: "gray900",
  },
  ghostS: {
    textVariant: "buttonS",
    color: "gray900",
  },
  disabled: {
    textVariant: "buttonM",
    color: "gray600",
  },
  qrCode: {
    textVariant: "buttonM",
    color: "gray100",
  },
  numkey: {
    textVariant: "numkey",
    color: "gray900",
  },
} as const;
