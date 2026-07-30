/**
 * @description Immutable XML character grammar sources enforced by SVG markup serialisation.
 */
export const svgMarkupSchema = Object.freeze({
  invalidCharacterPatternSource: String.raw`[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]`,
});
