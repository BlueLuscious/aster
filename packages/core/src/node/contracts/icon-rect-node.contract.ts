import type { IconPresentation } from "../../presentation/contracts/index.js";

/**
 * @description Portable rectangle geometry and its explicit presentation.
 */
export interface IconRectNode extends IconPresentation {
  /**
   * @description Discriminator identifying rectangle geometry.
   */
  readonly kind: "rect";

  /**
   * @description Finite horizontal origin coordinate.
   */
  readonly x: number;

  /**
   * @description Finite vertical origin coordinate.
   */
  readonly y: number;

  /**
   * @description Non-negative finite width.
   */
  readonly width: number;

  /**
   * @description Non-negative finite height.
   */
  readonly height: number;

  /**
   * @description Optional non-negative finite horizontal corner radius.
   */
  readonly radiusX?: number;

  /**
   * @description Optional non-negative finite vertical corner radius.
   */
  readonly radiusY?: number;
}
