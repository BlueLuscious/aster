import type { IconPresentation } from "../../presentation/contracts/index.js";

/**
 * @description Portable circle geometry and its explicit presentation.
 */
export interface IconCircleNode extends IconPresentation {
  /**
   * @description Discriminator identifying circle geometry.
   */
  readonly kind: "circle";

  /**
   * @description Finite horizontal centre coordinate.
   */
  readonly cx: number;

  /**
   * @description Finite vertical centre coordinate.
   */
  readonly cy: number;

  /**
   * @description Positive finite radius.
   */
  readonly radius: number;
}
