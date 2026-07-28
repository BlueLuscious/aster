import type { IconPresentation } from "../../presentation/contracts/index.js";

/**
 * @description Portable line geometry and its explicit presentation.
 */
export interface IconLineNode extends IconPresentation {
  /**
   * @description Discriminator identifying line geometry.
   */
  readonly kind: "line";

  /**
   * @description Finite horizontal start coordinate.
   */
  readonly x1: number;

  /**
   * @description Finite vertical start coordinate.
   */
  readonly y1: number;

  /**
   * @description Finite horizontal end coordinate.
   */
  readonly x2: number;

  /**
   * @description Finite vertical end coordinate.
   */
  readonly y2: number;
}
