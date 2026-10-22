import type { AsterReviewPlan } from "../../../review/contracts/index.js";
import type { TReviewOutputPublication } from "../../output/types/internal/review-output-publication.type.js";
import { HumanTextFormatter } from "./human-text.formatter.js";

/**
 * @description Renders headless review-plan evidence as deterministic human text.
 */
export class ReviewHumanOutputPresenter {
  /** @description Shared count and visible human-data formatting without altering review documents. */
  readonly #text = new HumanTextFormatter();

  /**
   * @description Renders truthful destination evidence after static review publication.
   * @param publication - Committed review publication evidence.
   * @returns Plain deterministic publication summary without a final newline.
   */
  publication(publication: TReviewOutputPublication): string {
    return publication.replaced
      ? `Replaced Aster review at ${this.#text.value(publication.targetRoot)}`
      : `Published Aster review to ${this.#text.value(publication.targetRoot)}`;
  }

  /**
   * @description Renders one complete review plan before document publication exists.
   * @param plan - Immutable technical review plan.
   * @returns Plain deterministic plan summary without a final newline.
   */
  plan(plan: AsterReviewPlan): string {
    const iconCount =
      plan.document.kind === "icon" ? 1 : plan.document.icons.length;
    return `Planned ${this.#text.value(plan.subject)} review for ${this.#text.value(plan.identity)} from ${this.#text.value(plan.catalogue)} with ${this.#text.count(iconCount, "icon")}`;
  }
}
