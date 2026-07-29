import type { SourceSpan } from "../../../diagnostic/contracts/index.js";

/**
 * @description Exact primitive bounds available without interpreting path curves.
 */
export type TLocatedBounds = {
  /**
   * @description Minimum horizontal geometry coordinate.
   */
  readonly minX: number;

  /**
   * @description Minimum vertical geometry coordinate.
   */
  readonly minY: number;

  /**
   * @description Maximum horizontal geometry coordinate.
   */
  readonly maxX: number;

  /**
   * @description Maximum vertical geometry coordinate.
   */
  readonly maxY: number;

  /**
   * @description Complete source span of the measured primitive.
   */
  readonly span: SourceSpan;
};
