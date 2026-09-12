import type { iconPathCommandKinds } from "../constants/icon-path-command-kinds.constant.js";
import type { IconPoint } from "./icon-point.contract.js";

/**
 * @description Absolute endpoint for one portable straight path segment.
 */
export interface IconPathLineCommand extends IconPoint {
  /**
   * @description Discriminator identifying an absolute straight segment.
   */
  readonly kind: typeof iconPathCommandKinds.line;
}
