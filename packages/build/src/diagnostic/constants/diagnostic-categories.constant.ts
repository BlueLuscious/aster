/**
 * @description Immutable diagnostic responsibility categories accepted by the build boundary.
 */
export const diagnosticCategories = Object.freeze({
  syntax: "syntax",
  safety: "safety",
  technical: "technical",
  metadata: "metadata",
  collection: "collection",
  generation: "generation",
} as const);
