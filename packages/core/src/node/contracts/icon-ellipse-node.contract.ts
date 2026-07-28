import type { IconPresentation } from "../../presentation/contracts/index.js";

/**
 * @description Portable ellipse geometry and its explicit presentation.
 */
export interface IconEllipseNode extends IconPresentation {
  /**
   * @description Discriminator identifying ellipse geometry.
   */
  readonly kind: "ellipse";

  /**
   * @description Finite horizontal centre coordinate.
   */
  readonly cx: number;

  /**
   * @description Finite vertical centre coordinate.
   */
  readonly cy: number;

  /**
   * @description Positive finite horizontal radius.
   */
  readonly radiusX: number;

  /**
   * @description Positive finite vertical radius.
   */
  readonly radiusY: number;
}
