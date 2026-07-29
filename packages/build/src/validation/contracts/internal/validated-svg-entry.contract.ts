import type { TSvgValidationMetrics } from "../../types/internal/svg-validation-metrics.type.js";
import type { IPairedSvgValidationEntry } from "./paired-svg-validation-entry.contract.js";

/**
 * @description Technically valid and semantically paired SVG entry accepted for normalisation.
 */
export interface IValidatedSvgEntry extends IPairedSvgValidationEntry {
  /**
   * @description Deterministic facts produced during technical validation.
   */
  readonly metrics: TSvgValidationMetrics;
}
