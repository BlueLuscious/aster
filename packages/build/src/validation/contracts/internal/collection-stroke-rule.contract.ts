import type { TCollectionRuleSeverity } from "../../types/internal/collection-rule-severity.type.js";

/**
 * @description Collection-owned accepted source stroke widths.
 */
export interface ICollectionStrokeRule {
  /**
   * @description Non-empty duplicate-free sequence of accepted non-negative source widths.
   */
  readonly acceptedWidths: readonly number[];

  /**
   * @description Whether an explicitly authored disagreement is advisory or blocking.
   */
  readonly severity: TCollectionRuleSeverity;
}
