/**
 * @description Immutable accepted source-element roles and non-presentation attribute schema.
 */
export const svgSourceElementSchema = Object.freeze({
  svg: Object.freeze({
    role: "root",
    attributes: Object.freeze(["viewBox", "xmlns"] as const),
  }),
  g: Object.freeze({
    role: "structural",
    attributes: Object.freeze([]),
  }),
  path: Object.freeze({
    role: "primitive",
    attributes: Object.freeze(["d"] as const),
  }),
  circle: Object.freeze({
    role: "primitive",
    attributes: Object.freeze(["cx", "cy", "r"] as const),
  }),
  ellipse: Object.freeze({
    role: "primitive",
    attributes: Object.freeze(["cx", "cy", "rx", "ry"] as const),
  }),
  rect: Object.freeze({
    role: "primitive",
    attributes: Object.freeze([
      "x",
      "y",
      "width",
      "height",
      "rx",
      "ry",
    ] as const),
  }),
  line: Object.freeze({
    role: "primitive",
    attributes: Object.freeze(["x1", "y1", "x2", "y2"] as const),
  }),
  polyline: Object.freeze({
    role: "primitive",
    attributes: Object.freeze(["points"] as const),
  }),
  polygon: Object.freeze({
    role: "primitive",
    attributes: Object.freeze(["points"] as const),
  }),
}) satisfies Readonly<
  Record<
    string,
    Readonly<{
      readonly role: "primitive" | "root" | "structural";
      readonly attributes: readonly string[];
    }>
  >
>;
