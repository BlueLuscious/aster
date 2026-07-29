import type { SourceDiagnostic } from "../../../diagnostic/contracts/index.js";
import type { IPairedSvgValidationEntry } from "../../contracts/internal/paired-svg-validation-entry.contract.js";

/**
 * @description Identity diagnostics and unambiguous SVG-to-metadata pairs resolved for safe analysis.
 */
export type TSvgIdentityValidation = {
  /**
   * @description Blocking identity, counterpart, and duplicate diagnostics.
   */
  readonly diagnostics: readonly SourceDiagnostic[];

  /**
   * @description Entries with exactly one metadata counterpart.
   */
  readonly entries: readonly IPairedSvgValidationEntry[];
};
