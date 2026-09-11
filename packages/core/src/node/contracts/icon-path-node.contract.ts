import type { IconPresentation } from "../../presentation/contracts/index.js";
import type { iconNodeKinds } from "../constants/icon-node-kinds.constant.js";
import type { IconPathCommandType } from "../types/icon-path-command.type.js";

/**
 * @description Portable canonical path geometry and its explicit presentation.
 */
export interface IconPathNode extends IconPresentation {
  /**
   * @description Discriminator identifying path geometry.
   */
  readonly kind: typeof iconNodeKinds.path;

  /**
   * @description Ordered non-empty sequence of canonical absolute path commands.
   * @remarks Every contour starts with a move and contains at least one drawing command.
   */
  readonly commands: readonly IconPathCommandType[];
}
