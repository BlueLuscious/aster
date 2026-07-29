import type { ICollectionBoundsRule } from "./collection-bounds-rule.contract.js";
import type { ICollectionComplexityRule } from "./collection-complexity-rule.contract.js";
import type { ICollectionGridRule } from "./collection-grid-rule.contract.js";
import type { ICollectionStrokeRule } from "./collection-stroke-rule.contract.js";
import type { ICollectionViewBoxRule } from "./collection-view-box-rule.contract.js";

/**
 * @description Accepted collection authority over provisional visual validation rules.
 */
export interface ICollectionValidationContract {
  /**
   * @description Canonical collection slug owning every configured rule.
   */
  readonly collection: string;

  /**
   * @description Optional expected coordinate-system rule.
   */
  readonly viewBox?: ICollectionViewBoxRule;

  /**
   * @description Optional accepted source-stroke rule.
   */
  readonly stroke?: ICollectionStrokeRule;

  /**
   * @description Optional construction-grid rule.
   */
  readonly grid?: ICollectionGridRule;

  /**
   * @description Optional nominal safe-area rule.
   */
  readonly bounds?: ICollectionBoundsRule;

  /**
   * @description Optional source-complexity rule.
   */
  readonly complexity?: ICollectionComplexityRule;
}
