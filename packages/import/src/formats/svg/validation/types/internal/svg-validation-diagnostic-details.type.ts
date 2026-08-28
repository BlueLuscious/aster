import type { TDiagnosticDetails } from "../../../../../diagnostic/types/internal/diagnostic-details.type.js";
import type { DiagnosticSeverityType } from "../../../../../diagnostic/types/index.js";

/**
 * @description Stable diagnostic metadata resolved from one SVG validation issue family.
 * @remarks Validation extends common diagnostic details with explicit blocking severity.
 */
export type TSvgValidationDiagnosticDetails = TDiagnosticDetails & {
  /**
   * @description Observable authority level selected for the validation issue.
   */
  readonly severity: DiagnosticSeverityType;
};
