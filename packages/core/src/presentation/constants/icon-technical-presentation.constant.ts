import type { IconPresentation } from "../contracts/index.js";

/**
 * @description Immutable lowest-precedence presentation of the portable icon model.
 */
export const iconTechnicalPresentation: Readonly<
  Required<IconPresentation>
> = Object.freeze({
  /** @description Technical interior paint. */
  fill: "#000000",
  /** @description Technical interior-fill algorithm. */
  fillRule: "nonzero",
  /** @description Technical outline paint. */
  stroke: "none",
  /** @description Technical outline width in viewBox units. */
  strokeWidth: 1,
  /** @description Technical outline endpoint shape. */
  strokeLineCap: "butt",
  /** @description Technical outline corner shape. */
  strokeLineJoin: "miter",
  /** @description Technical ratio limiting mitered corners. */
  strokeMiterLimit: 4,
  /** @description Technical overall opacity. */
  opacity: 1,
  /** @description Technical interior opacity. */
  fillOpacity: 1,
  /** @description Technical outline opacity. */
  strokeOpacity: 1,
});
