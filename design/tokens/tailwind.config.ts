/**
 * Bionta — Tailwind color config
 * Generated from Figma variables (file: Bionta Design, key v34S6c0aQGYqHY1eFIq48z)
 *
 * Usage in your project's tailwind.config.ts:
 *   import { biontaColors } from "./design/tokens/tailwind.config";
 *   export default {
 *     theme: { extend: { colors: biontaColors } }
 *   };
 *
 * Then in markup:
 *   <button class="bg-surface-brand text-text-on-brand hover:bg-action-primary-hover">
 *   <div class="bg-surface-page text-text-primary border-border-subtle">
 *
 * Rule: prefer semantic classes (bg-surface-*, text-text-*, border-border-*) over primitives.
 * Primitives (bg-brand-yellow-500, text-neutral-900) exist as escape hatches only.
 */

export const biontaColors = {
  // ──── Primitives ──────────────────────────────────────────────
  brand: {
    yellow: {
      50: "#FFF8E0",
      300: "#FAC938",
      500: "#FFC200",
      600: "#E5AD00",
      700: "#D99A2E",
    },
    green: {
      50: "#E3E9DA",
      500: "#2F4A2B",
      600: "#3D5A39",
      900: "#243121",
    },
  },
  cream: {
    50: "#FAF6EF",
    100: "#F1EBDE",
    200: "#E5DFD2",
    300: "#D9D1C7",
    700: "#7A7366",
  },
  neutral: {
    0: "#FFFFFF",
    50: "#F5F5F5",
    100: "#EDEDED",
    200: "#E0E0E0",
    300: "#C7C7C7",
    400: "#A6A6A6",
    500: "#8C8C8C",
    600: "#6B6B6B",
    700: "#4D4D4D",
    800: "#333333",
    900: "#1E1E1E",
  },
  red: {
    50: "#FCE6E8",
    500: "#ED2933",
    700: "#661A1A",
  },

  // ──── Semantic (consume these) ────────────────────────────────
  surface: {
    page: "#FAF6EF",
    raised: "#FFFFFF",
    "raised-subtle": "#F5F5F5",
    "raised-muted": "#EDEDED",
    sunken: "#F1EBDE",
    brand: "#FFC200",
    "brand-subtle": "#FFF8E0",
    inverse: "#2F4A2B",
    "inverse-strong": "#1E1E1E",
    "success-subtle": "#E3E9DA",
    "error-subtle": "#FCE6E8",
  },
  text: {
    primary: "#1E1E1E",
    strong: "#333333",
    secondary: "#6B6B6B",
    "secondary-strong": "#4D4D4D",
    muted: "#8C8C8C",
    "on-brand": "#1E1E1E",
    "on-inverse": "#FAF6EF",
    "on-cream": "#7A7366",
    link: "#2F4A2B",
    error: "#ED2933",
  },
  border: {
    subtle: "#E0E0E0",
    default: "#C7C7C7",
    "strong-subtle": "#A6A6A6",
    strong: "#1E1E1E",
    cream: "#E5DFD2",
    brand: "#FFC200",
    inverse: "#2F4A2B",
    error: "#ED2933",
  },
  action: {
    primary: "#FFC200",
    "primary-hover": "#E5AD00",
    secondary: "#2F4A2B",
    "secondary-hover": "#3D5A39",
  },
  feedback: {
    error: "#ED2933",
    success: "#2F4A2B",
    warning: "#E5AD00",
  },
} as const;

export type BiontaColors = typeof biontaColors;
