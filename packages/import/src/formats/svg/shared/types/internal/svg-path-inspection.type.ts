import type { TSvgPathSegment } from "./svg-path-segment.type.js";

/**
 * @description Technical result of inspecting one authored SVG path-data value.
 */
export type TSvgPathInspection = {
  /**
   * @description Whether the complete path value follows the accepted SVG path grammar.
   */
  readonly valid: boolean;

  /**
   * @description Number of expanded operations represented by the authored commands.
   */
  readonly commandCount: number;

  /**
   * @description Whether the path contains an operation capable of producing geometry.
   */
  readonly hasDrawingOperation: boolean;

  /**
   * @description Immutable source segments when the complete value is valid.
   */
  readonly segments?: readonly TSvgPathSegment[];
};
