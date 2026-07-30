import { iconPresentationOverrideOrder } from "@aster/core";

/**
 * @description Immutable runtime schema sources for the closed portable SVG render options.
 */
export const svgRenderOptionsSchema = Object.freeze({
  fields: Object.freeze([
    "size",
    "colour",
    ...iconPresentationOverrideOrder,
    "label",
    "title",
    "decorative",
    "direction",
  ] as const),
  invalidTextControlPatternSource: String.raw`[\u0000-\u001f\u007f]`,
});
