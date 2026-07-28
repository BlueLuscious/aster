import type {
  IconFillRuleType,
  IconPaintType,
  IconStrokeLineCapType,
  IconStrokeLineJoinType,
} from "../types/index.js";

/**
 * @description Explicit portable presentation retained by a node or collection default.
 */
export interface IconPresentation {
  /**
   * @description Paint applied to the interior geometry.
   */
  readonly fill?: IconPaintType;

  /**
   * @description Algorithm used to determine the interior geometry.
   */
  readonly fillRule?: IconFillRuleType;

  /**
   * @description Paint applied to the geometry outline.
   */
  readonly stroke?: IconPaintType;

  /**
   * @description Non-negative outline width expressed in viewBox units.
   */
  readonly strokeWidth?: number;

  /**
   * @description Shape used at open outline endpoints.
   */
  readonly strokeLineCap?: IconStrokeLineCapType;

  /**
   * @description Shape used where outline segments meet.
   */
  readonly strokeLineJoin?: IconStrokeLineJoinType;

  /**
   * @description Positive ratio limiting a miter join.
   */
  readonly strokeMiterLimit?: number;

  /**
   * @description Overall opacity in the inclusive range from zero to one.
   */
  readonly opacity?: number;

  /**
   * @description Interior opacity in the inclusive range from zero to one.
   */
  readonly fillOpacity?: number;

  /**
   * @description Outline opacity in the inclusive range from zero to one.
   */
  readonly strokeOpacity?: number;
}
