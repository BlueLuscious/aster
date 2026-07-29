import type { TCollectionRuleSeverity } from "../../types/internal/collection-rule-severity.type.js";

/**
 * @description Collection-owned provisional limits used to make source complexity visible.
 */
export interface ICollectionComplexityRule {
  /**
   * @description Inclusive positive maximum geometry primitive count.
   */
  readonly maxPrimitives: number;

  /**
   * @description Inclusive positive maximum explicit path-command count.
   */
  readonly maxPathCommands: number;

  /**
   * @description Whether exceeding either limit is advisory or blocking.
   */
  readonly severity: TCollectionRuleSeverity;
}
