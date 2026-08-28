import type { diagnosticCategories } from "../constants/diagnostic-categories.constant.js";

/**
 * @description Closed responsibility categories for source and adoption diagnostics.
 */
export type DiagnosticCategoryType =
  (typeof diagnosticCategories)[keyof typeof diagnosticCategories];
