/**
 * @description Immutable visual samples owned by the static review document.
 */
export const reviewDocumentPresentation = Object.freeze({
  sizes: Object.freeze([16, 24, 32, 48] as const),
  palettes: Object.freeze([
    Object.freeze({
      className: "review-palette-light",
      label: "Ink on light",
      foreground: "#172033",
      background: "#f8fafc",
    }),
    Object.freeze({
      className: "review-palette-dark",
      label: "White on dark",
      foreground: "#f8fafc",
      background: "#172033",
    }),
    Object.freeze({
      className: "review-palette-transparent",
      label: "Coral on transparency",
      foreground: "#d94841",
      background: "transparent checkerboard",
    }),
  ]),
} as const);
