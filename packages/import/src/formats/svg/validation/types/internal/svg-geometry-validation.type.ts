import type { SourceDiagnostic } from "../../../../../diagnostic/contracts/index.js";

/**
 * @description Technical geometry diagnostics and retained draft counts.
 */
export type TSvgGeometryValidation = {
  /**
   * @description Blocking geometry, path, attribute, and presentation diagnostics.
   */
  readonly diagnostics: readonly SourceDiagnostic[];

  /**
   * @description Supported geometry primitive count.
   */
  readonly primitiveCount: number;

  /**
   * @description Explicit supported path-command count.
   */
  readonly pathCommandCount: number;

};
