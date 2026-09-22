/**
 * @description Immutable accepted SVG paint keywords and literal-colour grammar sources.
 */
export const svgPaintSchema = Object.freeze({
  /** @description Portable paint grammar authority for keywords. */
  keywords: Object.freeze(["none", "currentColor"] as const),
  /** @description Portable paint grammar authority for short hex pattern source. */
  shortHexPatternSource: String.raw`^#[0-9a-f]{3}$`,
  /** @description Portable paint grammar authority for long hex pattern source. */
  longHexPatternSource: String.raw`^#[0-9a-f]{6}$`,
});
