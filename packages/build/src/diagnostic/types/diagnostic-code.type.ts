import type { DiagnosticCategoryType } from "./diagnostic-category.type.js";

/**
 * @description Aster-owned diagnostic identifier family.
 * @remarks Runtime construction enforces an uppercase category and exactly three digits.
 */
export type DiagnosticCodeType =
  `ASTER-${Uppercase<DiagnosticCategoryType>}-${number}`;
