/**
 * @description Immutable discriminators for every supported portable geometry node.
 */
export const iconNodeKinds = Object.freeze({
  /** @description Path-based portable geometry. */
  path: "path",
  /** @description Circular portable geometry. */
  circle: "circle",
  /** @description Elliptical portable geometry. */
  ellipse: "ellipse",
  /** @description Rectangular portable geometry. */
  rectangle: "rect",
  /** @description Straight portable line geometry. */
  line: "line",
  /** @description Open portable point-sequence geometry. */
  polyline: "polyline",
  /** @description Closed portable point-sequence geometry. */
  polygon: "polygon",
} as const);
