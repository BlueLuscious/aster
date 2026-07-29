import type { SourceDiagnostic } from "../../../diagnostic/contracts/index.js";
import type { TLocatedBounds } from "./located-bounds.type.js";
import type { TLocatedNumber } from "./located-number.type.js";

/**
 * @description Technical result produced by one supported SVG primitive validator.
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

  /**
   * @description Valid authored values available for provisional grid inspection.
   */
  readonly gridValues: readonly TLocatedNumber[];

  /**
   * @description Exactly computable primitive bounds.
   */
  readonly bounds: readonly TLocatedBounds[];
};
