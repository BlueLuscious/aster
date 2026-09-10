import type { reviewTargets } from "../constants/review-targets.constant.js";
import type {
  AsterReviewDocumentType,
  AsterReviewSubjectType,
} from "../types/index.js";

/**
 * @description Complete host-neutral review result before serialisation or publication effects.
 */
export interface AsterReviewPlan {
  /**
   * @description Output representation intended for later deterministic serialisation.
   */
  readonly target: typeof reviewTargets.html;

  /**
   * @description Portable value family selected by the command.
   */
  readonly subject: AsterReviewSubjectType;

  /**
   * @description Exact catalogue provider that supplied the selected definitions.
   */
  readonly catalogue: string;

  /**
   * @description Canonical textual identity selected by the command.
   */
  readonly identity: string;

  /**
   * @description Complete immutable technical model for static document serialisation.
   */
  readonly document: AsterReviewDocumentType;
}
