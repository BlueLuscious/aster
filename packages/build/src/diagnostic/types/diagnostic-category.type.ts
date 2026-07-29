import type { diagnosticCategories } from "../constants/diagnostic-categories.constant.js";

/**
 * @description Closed responsibility categories for source and generation diagnostics.
 */
export type DiagnosticCategoryType =
  (typeof diagnosticCategories)[keyof typeof diagnosticCategories];
