/**
 * @description Format-neutral technical facts retained for adoption review.
 */
export interface IconImportMetrics {
  /**
   * @description Number of accepted portable geometry primitives.
   */
  readonly primitiveCount: number;

  /**
   * @description Number of portable path operations produced from accepted source.
   */
  readonly pathCommandCount: number;
}
