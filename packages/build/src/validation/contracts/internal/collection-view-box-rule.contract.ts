import type { IconViewBox } from "@aster/core";
import type { TCollectionRuleSeverity } from "../../types/internal/collection-rule-severity.type.js";

/**
 * @description Collection-owned expected coordinate system and its accepted enforcement authority.
 */
export interface ICollectionViewBoxRule {
  /**
   * @description Expected canonical portable coordinate system.
   */
  readonly expected: IconViewBox;

  /**
   * @description Whether disagreement is advisory or blocking.
   */
  readonly severity: TCollectionRuleSeverity;
}
