import type { TCollectionRuleSeverity } from "../../types/internal/collection-rule-severity.type.js";

/**
 * @description Collection-owned construction-grid hypothesis.
 */
export interface ICollectionGridRule {
  /**
   * @description Positive interval used to inspect authored geometry values.
   */
  readonly step: number;

  /**
   * @description Whether off-grid geometry is advisory or blocking.
   */
  readonly severity: TCollectionRuleSeverity;
}
