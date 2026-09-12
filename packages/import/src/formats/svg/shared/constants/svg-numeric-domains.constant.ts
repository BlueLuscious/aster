/**
 * @description Immutable numeric domains enforced by portable SVG presentation validation.
 */
export const svgNumericDomains = Object.freeze({
  /** @description Canonical numeric domain for finite values. */
  finite: "finite",
  /** @description Canonical numeric domain for non negative values. */
  nonNegative: "non-negative",
  /** @description Canonical numeric domain for opacity values. */
  opacity: "opacity",
  /** @description Canonical numeric domain for positive values. */
  positive: "positive",
} as const);
