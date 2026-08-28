import type { SourceDiagnostic } from "../../../../../diagnostic/contracts/index.js";
import type { TSvgValidationMetrics } from "./svg-validation-metrics.type.js";

/**
 * @description Partial technical analysis retained only to preserve independent safe diagnostics.
 */
export type TSvgTechnicalValidation = {
  /**
   * @description Blocking technical and syntax diagnostics in semantic encounter order.
   */
  readonly diagnostics: readonly SourceDiagnostic[];

  /**
   * @description Safely computed facts available even when unrelated source values are invalid.
   */
  readonly metrics: TSvgValidationMetrics;
};
