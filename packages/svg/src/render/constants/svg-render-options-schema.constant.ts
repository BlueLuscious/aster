import { iconPresentationOverrideOrder } from "@aster/core";

/**
 * @description Immutable closed field authority for portable SVG render options.
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
});
