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
 * @remarks Relative coordinates, repeated operand groups and shorthand controls belong to source
 * formats and must be expanded before entering a canonical definition.
 */
export type IconPathCommandType =
  | IconPathMoveCommand
  | IconPathLineCommand
  | IconPathCubicBezierCommand
  | IconPathQuadraticBezierCommand
  | IconPathArcCommand
  | IconPathCloseCommand;
