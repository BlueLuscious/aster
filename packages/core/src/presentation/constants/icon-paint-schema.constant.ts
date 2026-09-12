/**
 * @description Immutable portable paint keywords and literal-colour grammar sources.
 */
export const iconPaintSchema = Object.freeze({
  /** @description Closed portable paint keywords. */
  keywords: Object.freeze(["none", "currentColor"] as const),
  /** @description Complete lowercase three-digit hexadecimal colour grammar. */
  shortHexPatternSource: String.raw`^#[0-9a-f]{3}$`,
  /** @description Complete lowercase six-digit hexadecimal colour grammar. */
  longHexPatternSource: String.raw`^#[0-9a-f]{6}$`,
});
