import { iconPresentationOverrideOrder } from "@aster/core";

/**
 * @description Immutable closed field authority for portable SVG render options.
 */
export const svgRenderOptionsSchema = Object.freeze({
  /** @description Complete ordered render-option field vocabulary. */
  fields: Object.freeze([
    "size",
    "colour",
    ...iconPresentationOverrideOrder,
    "label",
    "title",
    "decorative",
    "direction",
  ] as const),
});
