/**
 * @description Immutable portable paint keywords and literal-colour grammar sources.
 */
export const iconPaintSchema = Object.freeze({
  keywords: Object.freeze(["none", "currentColor"] as const),
  shortHexPatternSource: String.raw`^#[0-9a-f]{3}$`,
  longHexPatternSource: String.raw`^#[0-9a-f]{6}$`,
});
