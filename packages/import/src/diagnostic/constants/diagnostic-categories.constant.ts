/**
 * @description Immutable diagnostic responsibility categories accepted by Import.
 */
export const diagnosticCategories = Object.freeze({
  /** @description Canonical diagnostic category for syntax concerns. */
  syntax: "syntax",
  /** @description Canonical diagnostic category for safety concerns. */
  safety: "safety",
  /** @description Canonical diagnostic category for technical concerns. */
  technical: "technical",
  /** @description Canonical diagnostic category for adoption concerns. */
  adoption: "adoption",
} as const);
