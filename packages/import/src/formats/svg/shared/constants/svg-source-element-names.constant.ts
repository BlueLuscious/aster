/**
 * @description Immutable names of every SVG element recognised by the portable source subset.
 */
export const svgSourceElementNames = Object.freeze({
  /** @description Canonical SVG source element name for root. */
  root: "svg",
  /** @description Canonical SVG source element name for group. */
  group: "g",
  /** @description Canonical SVG source element name for path. */
  path: "path",
  /** @description Canonical SVG source element name for circle. */
  circle: "circle",
  /** @description Canonical SVG source element name for ellipse. */
  ellipse: "ellipse",
  /** @description Canonical SVG source element name for rectangle. */
  rectangle: "rect",
  /** @description Canonical SVG source element name for line. */
  line: "line",
  /** @description Canonical SVG source element name for polyline. */
  polyline: "polyline",
  /** @description Canonical SVG source element name for polygon. */
  polygon: "polygon",
} as const);
