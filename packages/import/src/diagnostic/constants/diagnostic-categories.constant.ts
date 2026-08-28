/**
 * @description Immutable diagnostic responsibility categories accepted by Import.
 */
export const diagnosticCategories = Object.freeze({
  syntax: "syntax",
  safety: "safety",
  technical: "technical",
  adoption: "adoption",
} as const);
