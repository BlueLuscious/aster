/**
 * @description Finite logical coordinate system enclosing portable icon geometry.
 */
export interface IconViewBox {
  /**
   * @description Minimum horizontal coordinate.
   */
  readonly minX: number;

  /**
   * @description Minimum vertical coordinate.
   */
  readonly minY: number;

  /**
   * @description Positive logical width.
   */
  readonly width: number;

  /**
   * @description Positive logical height.
   */
  readonly height: number;
}
