import type { reviewSubjects } from "../constants/review-subjects.constant.js";

/**
 * @description Portable value family accepted by deterministic review planning.
 */
export type AsterReviewSubjectType =
  (typeof reviewSubjects)[keyof typeof reviewSubjects];
