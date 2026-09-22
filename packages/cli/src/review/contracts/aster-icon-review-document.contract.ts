import type { reviewSubjects } from "../constants/review-subjects.constant.js";
import type { AsterReviewIconEvidence } from "./aster-review-icon-evidence.contract.js";

/**
 * @description Complete technical review model for one exact icon.
 */
export interface AsterIconReviewDocument {
  /**
   * @description Discriminator for one icon review document.
   */
  readonly kind: typeof reviewSubjects.icon;

  /**
   * @description Complete evidence for the selected icon.
   */
  readonly icon: AsterReviewIconEvidence;
}
