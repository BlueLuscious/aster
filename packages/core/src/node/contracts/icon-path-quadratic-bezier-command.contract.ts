import type { iconPathCommandKinds } from "../constants/icon-path-command-kinds.constant.js";
import type { IconPoint } from "./icon-point.contract.js";

/**
 * @description Absolute endpoint and control for one portable quadratic Bezier segment.
 */
export interface IconPathQuadraticBezierCommand extends IconPoint {
  /**
   * @description Discriminator identifying an absolute quadratic Bezier segment.
   */
  readonly kind: typeof iconPathCommandKinds.quadraticBezier;

  /**
   * @description Finite horizontal coordinate of the control point.
   */
  readonly controlX: number;

  /**
   * @description Finite vertical coordinate of the control point.
   */
  readonly controlY: number;
}
