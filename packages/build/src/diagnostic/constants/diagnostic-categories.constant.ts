import type { DiagnosticCategoryType } from "../types/diagnostic-category.type.js";

/**
 * @description Immutable diagnostic responsibility categories accepted by the build boundary.
 */
export const diagnosticCategories = Object.freeze([
  "syntax",
  "safety",
  "technical",
  "collection",
  "generation",
] as const satisfies readonly DiagnosticCategoryType[]);
