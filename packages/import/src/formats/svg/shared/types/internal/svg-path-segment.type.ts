import type { TSvgPathCommand } from "./svg-path-command.type.js";

/**
 * @description Internal accepted SVG path segment with authored command casing and mutable parameters.
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
   * @description Parsed finite parameters accumulated for the segment.
   */
  readonly values: number[];
};
