import type { iconPathCommandKinds } from "../constants/icon-path-command-kinds.constant.js";
import type { IconPoint } from "./icon-point.contract.js";

/**
 * @description Absolute starting coordinate for one portable path contour.
 */
export interface IconPathMoveCommand extends IconPoint {
  /**
   * @description Discriminator identifying an absolute contour movement.
   */
  readonly kind: typeof iconPathCommandKinds.move;
}
