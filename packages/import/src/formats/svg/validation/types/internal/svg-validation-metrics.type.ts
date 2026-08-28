import type { TLocatedBounds } from "./located-bounds.type.js";
import type { TLocatedNumber } from "./located-number.type.js";
import type { TLocatedViewBox } from "./located-view-box.type.js";

/**
 * @description Deterministic technical facts retained for host-owned adoption review.
 */
export type TSvgValidationMetrics = {
  /**
   * @description Parsed viewBox when technically valid.
   */
  readonly viewBox?: TLocatedViewBox;

  /**
   * @description Number of supported geometry primitives.
   */
  readonly primitiveCount: number;

  /**
   * @description Number of explicitly authored supported path commands.
   */
  readonly pathCommandCount: number;

  /**
   * @description Geometry values available for provisional grid inspection.
   */
  readonly gridValues: readonly TLocatedNumber[];

  /**
   * @description Explicitly authored stroke widths available for collection inspection.
   */
  readonly strokeWidths: readonly TLocatedNumber[];

  /**
   * @description Primitive bounds computable without path-curve interpretation.
   */
  readonly bounds: readonly TLocatedBounds[];
};
