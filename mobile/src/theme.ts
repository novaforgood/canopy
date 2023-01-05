import { createTheme } from "@shopify/restyle";

type BaseTextVariant =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "subheading1"
  | "subheading2"
  | "body1"
  | "body2"
  | "body3";

const textSizes: Record<BaseTextVariant, { fontSize: number }> = {
  heading1: { fontSize: 56 },
  heading2: { fontSize: 44 },
  heading3: { fontSize: 36 },
  heading4: { fontSize: 24 },
  subheading1: { fontSize: 20 },
  subheading2: { fontSize: 18 },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  body3: { fontSize: 12 },
} as const;

const BASE_FONT = "Rubik";
const FONT_WEIGHTS = ["400Regular", "500Medium", "700Bold"] as const;
type FontWeight = typeof FONT_WEIGHTS[number];

const ITALIC = "Italic";

const MAP_WEIGHT_TO_NAME: Record<FontWeight, string> = {
  "400Regular": "",
  "500Medium": "Medium",
  "700Bold": "Bold",
};

export type TextVariant =
  | BaseTextVariant
  | `${BaseTextVariant}Italic`
  | `${BaseTextVariant}Medium`
  | `${BaseTextVariant}MediumItalic`
  | `${BaseTextVariant}Bold`
  | `${BaseTextVariant}BoldItalic`;

function makeTextVariants() {
  const baseVariants: BaseTextVariant[] = [
    "heading1",
    "heading2",
    "heading3",
    "heading4",
    "subheading1",
    "subheading2",
    "body1",
    "body2",
    "body3",
  ];

  return baseVariants.reduce((acc, variant) => {
    FONT_WEIGHTS.forEach((weight) => {
      const weightName = MAP_WEIGHT_TO_NAME[weight];
      acc[variant + weightName] = {
        ...textSizes[variant],
        fontFamily: [BASE_FONT, weight].join("_"),
      };
      acc[variant + weightName + ITALIC] = {
        ...textSizes[variant],
        fontFamily: [BASE_FONT, weight, ITALIC].join("_"),
      };
    });
    return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as Record<string, any>) as Record<TextVariant, any>;
}

const textVariants = makeTextVariants();

const buttonVariants = {
  primary: {
    bg: "gray900",
  },
  cta: {
    bg: "brandPrimary",
  },
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export const buttonTextStyles: Record<
  ButtonVariant,
  { variant: TextVariant; color: keyof Theme["colors"] }
> = {
  primary: {
    variant: "body1",
    color: "gray100",
  },
  cta: {
    variant: "body1",
    color: "gray100",
  },
} as const;

type Base = "base";
type Append = "append";
type Product = Base | Append;

const SPACING_MAP = {
  1: 4,
  1.5: 6,
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

  [-1]: -4,
  [-1.5]: -6,
  [-2]: -8,
  [-3]: -12,
  [-4]: -16,
  [-5]: -20,
  [-6]: -24,
  [-7]: -28,
  [-8]: -32,
  [-10]: -40,
  [-12]: -48,
  [-14]: -56,
  [-16]: -64,
} as const;

const theme = createTheme({
  colors: {
    black: "#000000",
    white: "#FFFFFF",
    transparent: "transparent",
    systemError: "red",

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
  spacing: SPACING_MAP,
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  textVariants: {
    defaults: {
      color: "gray900",
      fontFamily: "Rubik_400Regular",
    },
    ...textVariants,
  },
  borderRadii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  buttonVariants: {
    ...buttonVariants,
  },
});

export type Theme = typeof theme;
export default theme;
