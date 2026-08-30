import type { IconViewBox } from "@aster/core";

/**
 * @description Deterministic technical facts consumed by the imported draft.
 */
export type TSvgValidationMetrics = {
  /**
   * @description Parsed viewBox when technically valid.
   */
  readonly viewBox?: IconViewBox;

  /**
   * @description Number of supported geometry primitives.
   */
  readonly primitiveCount: number;

  /**
   * @description Number of explicitly authored supported path commands.
   */
  readonly pathCommandCount: number;

};
