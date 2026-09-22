/**
 * @description Immutable visual samples owned by the static review document.
 */
export const reviewDocumentPresentation = Object.freeze({
  /** @description Canonical pixel sizes rendered in each review size ladder. */
  sizes: Object.freeze([16, 24, 32, 48] as const),
  /** @description Canonical visual environments used to inspect icon paint behaviour. */
  palettes: Object.freeze([
    Object.freeze({
      /** @description CSS class applying the light review palette. */
      className: "review-palette-light",
      /** @description Human-readable light-palette label. */
      label: "Ink on light",
      /** @description Foreground colour applied by the light palette. */
      foreground: "#172033",
      /** @description Background colour applied by the light palette. */
      background: "#f8fafc",
    }),
    Object.freeze({
      /** @description CSS class applying the dark review palette. */
      className: "review-palette-dark",
      /** @description Human-readable dark-palette label. */
      label: "White on dark",
      /** @description Foreground colour applied by the dark palette. */
      foreground: "#f8fafc",
      /** @description Background colour applied by the dark palette. */
      background: "#172033",
    }),
    Object.freeze({
      /** @description CSS class applying the transparency review palette. */
      className: "review-palette-transparent",
      /** @description Human-readable transparency-palette label. */
      label: "Coral on transparency",
      /** @description Foreground colour applied over the transparency guide. */
      foreground: "#d94841",
      /** @description Human-readable background description for technical evidence. */
      background: "transparent checkerboard",
    }),
  ]),
} as const);
