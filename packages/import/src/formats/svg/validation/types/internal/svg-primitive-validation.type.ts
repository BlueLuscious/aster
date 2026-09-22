import type { SourceDiagnostic } from "../../../../../diagnostic/contracts/index.js";

/**
 * @description Technical diagnostics and retained count produced by one primitive validator.
 */
export type TSvgPrimitiveValidation = {
  /**
   * @description Blocking primitive diagnostics.
   */
  readonly diagnostics: readonly SourceDiagnostic[];

  /**
   * @description Explicit path-command count contributed by the primitive.
   */
  readonly pathCommandCount: number;

};
