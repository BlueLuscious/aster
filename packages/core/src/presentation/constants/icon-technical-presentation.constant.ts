import type { IconPresentation } from "../contracts/index.js";

/**
 * @description Immutable lowest-precedence presentation of the portable icon model.
 */
export const iconTechnicalPresentation: Readonly<
  Required<IconPresentation>
> = Object.freeze({
  fill: "#000000",
  fillRule: "nonzero",
  stroke: "none",
  strokeWidth: 1,
  strokeLineCap: "butt",
  strokeLineJoin: "miter",
  strokeMiterLimit: 4,
  opacity: 1,
  fillOpacity: 1,
  strokeOpacity: 1,
});
