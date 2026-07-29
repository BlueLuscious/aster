/**
 * @description Immutable discriminators for every supported portable geometry node.
 */
export const iconNodeKinds = Object.freeze({
  path: "path",
  circle: "circle",
  ellipse: "ellipse",
  rectangle: "rect",
  line: "line",
  polyline: "polyline",
  polygon: "polygon",
} as const);
