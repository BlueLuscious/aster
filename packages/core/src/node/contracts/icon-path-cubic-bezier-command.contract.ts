import type { iconPathCommandKinds } from "../constants/icon-path-command-kinds.constant.js";
import type { IconPoint } from "./icon-point.contract.js";

/**
 * @description Absolute endpoint and two controls for one portable cubic Bezier segment.
 */
export interface IconPathCubicBezierCommand extends IconPoint {
  /**
   * @description Discriminator identifying an absolute cubic Bezier segment.
   */
  readonly kind: typeof iconPathCommandKinds.cubicBezier;

  /**
   * @description Finite horizontal coordinate of the first control point.
   */
  readonly control1X: number;

  /**
   * @description Finite vertical coordinate of the first control point.
   */
  readonly control1Y: number;

  /**
   * @description Finite horizontal coordinate of the second control point.
   */
  readonly control2X: number;

  /**
   * @description Finite vertical coordinate of the second control point.
   */
  readonly control2Y: number;
}
