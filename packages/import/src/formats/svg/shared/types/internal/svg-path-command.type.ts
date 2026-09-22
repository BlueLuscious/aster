import type { svgPathCommands } from "../../constants/svg-path-commands.constant.js";

/**
 * @description Internal lowercase command supported by the portable SVG path grammar.
 */
export type TSvgPathCommand =
  (typeof svgPathCommands)[keyof typeof svgPathCommands];
