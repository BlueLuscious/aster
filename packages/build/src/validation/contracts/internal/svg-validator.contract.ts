import type { DiagnosticResultType } from "../../../diagnostic/types/index.js";
import type { ISvgValidationEvidence } from "./svg-validation-evidence.contract.js";
import type { ISvgValidationUnit } from "./svg-validation-unit.contract.js";

/**
 * @description Internal authority that applies universal and collection-owned SVG validation.
 */
export interface ISvgValidator {
  /**
   * @description Validates one complete configured generation unit.
   * @param unit - Acquired source pairs and accepted collection rules.
   * @returns Complete validation evidence with advisories, or blocking diagnostics without output.
   */
  validate(
    unit: ISvgValidationUnit,
  ): DiagnosticResultType<ISvgValidationEvidence>;
}
