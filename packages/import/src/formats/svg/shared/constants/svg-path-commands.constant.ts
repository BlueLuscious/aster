/**
 * @description Immutable lowercase commands supported by the portable SVG path grammar.
 */
export const svgPathCommands = Object.freeze({
  /** @description Canonical SVG command letter for arc segments. */
  arc: "a",
  /** @description Canonical SVG command letter for cubic bezier segments. */
  cubicBezier: "c",
  /** @description Canonical SVG command letter for horizontal line segments. */
  horizontalLine: "h",
  /** @description Canonical SVG command letter for line segments. */
  line: "l",
  /** @description Canonical SVG command letter for move segments. */
  move: "m",
  /** @description Canonical SVG command letter for quadratic bezier segments. */
  quadraticBezier: "q",
  /** @description Canonical SVG command letter for smooth cubic bezier segments. */
  smoothCubicBezier: "s",
  /** @description Canonical SVG command letter for smooth quadratic bezier segments. */
  smoothQuadraticBezier: "t",
  /** @description Canonical SVG command letter for vertical line segments. */
  verticalLine: "v",
  /** @description Canonical SVG command letter for close segments. */
  close: "z",
} as const);
