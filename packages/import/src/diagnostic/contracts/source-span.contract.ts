import type { SourcePosition } from "./source-position.contract.js";

/**
 * @description Inclusive start and exclusive end positions in one canonical source.
 */
export interface SourceSpan {
  /**
   * @description Inclusive source position.
   */
  readonly start: SourcePosition;

  /**
   * @description Exclusive source position.
   */
  readonly end: SourcePosition;
}
