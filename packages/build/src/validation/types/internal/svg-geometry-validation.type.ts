import type { SourceDiagnostic } from "../../../diagnostic/contracts/index.js";
import type { TLocatedBounds } from "./located-bounds.type.js";
import type { TLocatedNumber } from "./located-number.type.js";

/**
 * @description Technical geometry diagnostics and safely computed advisory facts.
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

  /**
   * @description Valid authored geometry values available for grid inspection.
   */
  readonly gridValues: readonly TLocatedNumber[];

  /**
   * @description Valid explicitly authored stroke widths.
   */
  readonly strokeWidths: readonly TLocatedNumber[];

  /**
   * @description Exactly computable non-path primitive bounds.
   */
  readonly bounds: readonly TLocatedBounds[];
};
