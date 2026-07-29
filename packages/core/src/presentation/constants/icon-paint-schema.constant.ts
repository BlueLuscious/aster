import type { IconPaintType } from "../types/index.js";

/**
 * @description Immutable portable paint keywords and literal-colour grammar sources.
 */
export const iconPaintSchema = Object.freeze({
  keywords: Object.freeze([
    "none",
    "currentColor",
  ] as const satisfies readonly IconPaintType[]),
  shortHexPatternSource: String.raw`^#[0-9a-f]{3}$`,
  longHexPatternSource: String.raw`^#[0-9a-f]{6}$`,
});
