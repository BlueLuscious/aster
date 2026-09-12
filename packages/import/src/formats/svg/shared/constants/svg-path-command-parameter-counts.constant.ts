import { svgPathCommands } from "./svg-path-commands.constant.js";

/**
 * @description Immutable parameter-group arity for every accepted SVG path command.
 */
export const svgPathCommandParameterCounts = Object.freeze({
  /** @description Parameter count for the SVG arc path command. */
  [svgPathCommands.arc]: 7,
  /** @description Parameter count for the SVG cubic bezier path command. */
  [svgPathCommands.cubicBezier]: 6,
  /** @description Parameter count for the SVG horizontal line path command. */
  [svgPathCommands.horizontalLine]: 1,
  /** @description Parameter count for the SVG line path command. */
  [svgPathCommands.line]: 2,
  /** @description Parameter count for the SVG move path command. */
  [svgPathCommands.move]: 2,
  /** @description Parameter count for the SVG quadratic bezier path command. */
  [svgPathCommands.quadraticBezier]: 4,
  /** @description Parameter count for the SVG smooth cubic bezier path command. */
  [svgPathCommands.smoothCubicBezier]: 4,
  /** @description Parameter count for the SVG smooth quadratic bezier path command. */
  [svgPathCommands.smoothQuadraticBezier]: 2,
  /** @description Parameter count for the SVG vertical line path command. */
  [svgPathCommands.verticalLine]: 1,
  /** @description Parameter count for the SVG close path command. */
  [svgPathCommands.close]: 0,
}) satisfies Readonly<Record<string, number>>;
