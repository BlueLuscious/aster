import type { TSvgPathCommand } from "./svg-path-command.type.js";

/**
 * @description Internal accepted SVG path segment with authored command casing and finite parameters.
 */
export type TSvgPathSegment = {
  /**
   * @description Exact authored command character.
   */
  readonly authoredCommand: string;

  /**
   * @description Canonical lowercase supported command.
   */
  readonly command: TSvgPathCommand;

  /**
   * @description Immutable finite parameters retained for the authored command.
   */
  readonly values: readonly number[];
};
