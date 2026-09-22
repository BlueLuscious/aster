import type { iconPathCommandKinds } from "../constants/icon-path-command-kinds.constant.js";
import type { IconPoint } from "./icon-point.contract.js";

/**
 * @description Absolute endpoint and ellipse parameters for one portable arc segment.
 */
export interface IconPathArcCommand extends IconPoint {
  /**
   * @description Discriminator identifying an absolute elliptical arc segment.
   */
  readonly kind: typeof iconPathCommandKinds.arc;

  /**
   * @description Finite non-negative horizontal ellipse radius.
   */
  readonly radiusX: number;

  /**
   * @description Finite non-negative vertical ellipse radius.
   */
  readonly radiusY: number;

  /**
   * @description Finite ellipse-axis rotation in degrees.
   */
  readonly rotation: number;

  /**
   * @description Whether the selected arc spans more than 180 degrees.
   */
  readonly largeArc: boolean;

  /**
   * @description Whether the selected arc follows the positive-angle direction.
   */
  readonly sweep: boolean;
}
