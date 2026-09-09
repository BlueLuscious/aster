import type { AsterReviewPlan } from "../../../review/contracts/index.js";

/**
 * @description Renders headless review-plan evidence as deterministic human text.
 */
export class ReviewHumanOutputPresenter {
  /**
   * @description Renders one complete review plan before document publication exists.
   * @param plan - Immutable technical review plan.
   * @returns Plain deterministic plan summary without a final newline.
   */
  plan(plan: AsterReviewPlan): string {
    const iconCount = plan.document.kind === "icon"
      ? 1
      : plan.document.icons.length;
    return `Planned ${plan.subject} review for ${plan.identity} from ${plan.catalogue} with ${iconCount} icon${iconCount === 1 ? "" : "s"}`;
  }
}
