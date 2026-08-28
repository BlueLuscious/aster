/**
 * @description Format-neutral technical facts retained for adoption review.
 */
export interface IconImportMetrics {
  /**
   * @description Number of accepted portable geometry primitives.
   */
  readonly primitiveCount: number;

  /**
   * @description Number of accepted authored path commands.
   */
  readonly pathCommandCount: number;
}
