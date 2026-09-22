/**
 * @description Immutable portable value families accepted by review planning.
 */
export const reviewSubjects = Object.freeze({
  /** @description Exact icon selected for review. */
  icon: "icon",
  /** @description Exact collection selected for review. */
  collection: "collection",
} as const);
