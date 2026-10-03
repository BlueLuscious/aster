/**
 * @description Format-neutral technical facts retained for adoption review.
 */
export interface IconImportMetrics {
  /**
   * @description Number of accepted primitives, equal to the canonical node count.
   */
  readonly primitiveCount: number;

  /**
   * @description Number of portable path operations, equal to the canonical path command count.
   */
  readonly pathCommandCount: number;
}
