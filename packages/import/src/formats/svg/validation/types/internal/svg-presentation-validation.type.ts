import type { SourceDiagnostic } from "../../../../../diagnostic/contracts/index.js";
import type { TLocatedNumber } from "./located-number.type.js";

/**
 * @description Technical presentation diagnostics and safely parsed explicit stroke facts.
 */
export type TSvgPresentationValidation = {
  /**
   * @description Blocking malformed presentation diagnostics.
   */
  readonly diagnostics: readonly SourceDiagnostic[];

  /**
   * @description Valid explicitly authored stroke widths.
   */
  readonly strokeWidths: readonly TLocatedNumber[];
};
