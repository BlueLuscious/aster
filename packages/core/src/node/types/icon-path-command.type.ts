import type {
  IconPathArcCommand,
  IconPathCloseCommand,
  IconPathCubicBezierCommand,
  IconPathLineCommand,
  IconPathMoveCommand,
  IconPathQuadraticBezierCommand,
} from "../contracts/index.js";

/**
 * @description Closed union of absolute portable path commands.
 */
export type IconPathCommandType =
  | IconPathMoveCommand
  | IconPathLineCommand
  | IconPathCubicBezierCommand
  | IconPathQuadraticBezierCommand
  | IconPathArcCommand
  | IconPathCloseCommand;
