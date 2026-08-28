import type { SourceDiagnostic } from "../../contracts/index.js";

/**
 * @description Canonical diagnostic paired with its stable semantic encounter order.
 */
export type TIndexedDiagnostic = {
  /**
   * @description Canonical diagnostic retained for aggregation.
   */
  readonly diagnostic: SourceDiagnostic;

  /**
   * @description Zero-based semantic encounter order used as the final stable tie-breaker.
   */
  readonly index: number;
};
