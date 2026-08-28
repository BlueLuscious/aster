/**
 * @description Immutable names of every SVG element recognised by the portable source subset.
 */
export const svgSourceElementNames = Object.freeze({
  root: "svg",
  group: "g",
  path: "path",
  circle: "circle",
  ellipse: "ellipse",
  rectangle: "rect",
  line: "line",
  polyline: "polyline",
  polygon: "polygon",
} as const);
