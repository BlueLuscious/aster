import type { TCollectionRuleSeverity } from "../../types/internal/collection-rule-severity.type.js";

/**
 * @description Collection-owned nominal safe-area hypothesis.
 */
export interface ICollectionBoundsRule {
  /**
   * @description Non-negative left, top, right, and bottom insets from the viewBox.
   */
  readonly inset: readonly [number, number, number, number];

  /**
   * @description Whether geometry outside the nominal area is advisory or blocking.
   */
  readonly severity: TCollectionRuleSeverity;
}
