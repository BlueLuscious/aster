/**
 * @description Immutable lowercase commands supported by the portable SVG path grammar.
 */
export const svgPathCommands = Object.freeze({
  arc: "a",
  cubicBezier: "c",
  horizontalLine: "h",
  line: "l",
  move: "m",
  quadraticBezier: "q",
  smoothCubicBezier: "s",
  smoothQuadraticBezier: "t",
  verticalLine: "v",
  close: "z",
} as const);
