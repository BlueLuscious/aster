/**
 * @description Immutable discriminators for public catalogue discovery results.
 */
export const catalogueResultKinds = Object.freeze({
  /** @description Result describing one canonical icon record. */
  icon: "icon",
  /** @description Result describing one canonical collection record. */
  collection: "collection",
} as const);
