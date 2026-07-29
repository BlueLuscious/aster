import { svgPathCommands } from "./svg-path-commands.constant.js";

/**
 * @description Immutable parameter-group arity for every accepted SVG path command.
 */
export const svgPathCommandParameterCounts = Object.freeze({
  [svgPathCommands.arc]: 7,
  [svgPathCommands.cubicBezier]: 6,
  [svgPathCommands.horizontalLine]: 1,
  [svgPathCommands.line]: 2,
  [svgPathCommands.move]: 2,
  [svgPathCommands.quadraticBezier]: 4,
  [svgPathCommands.smoothCubicBezier]: 4,
  [svgPathCommands.smoothQuadraticBezier]: 2,
  [svgPathCommands.verticalLine]: 1,
  [svgPathCommands.close]: 0,
}) satisfies Readonly<Record<string, number>>;
