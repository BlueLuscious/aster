import type { iconPathCommandKinds } from "../constants/icon-path-command-kinds.constant.js";

/**
 * @description Portable command closing the current contour to its starting coordinate.
 */
export interface IconPathCloseCommand {
  /**
   * @description Discriminator identifying contour closure.
   */
  readonly kind: typeof iconPathCommandKinds.close;
}
