import type { DiagnosticCategoryType } from "../diagnostic-category.type.js";
import type { DiagnosticCodeType } from "../diagnostic-code.type.js";

/**
 * @description Stable observable metadata resolved for one internal diagnostic family.
 * @remarks Source identity, locations, and related context remain occurrence-specific and are
 * supplied separately when constructing the complete diagnostic.
 */
export type TDiagnosticDetails = {
  readonly code: DiagnosticCodeType;
  readonly category: DiagnosticCategoryType;
  readonly message: string;
};
