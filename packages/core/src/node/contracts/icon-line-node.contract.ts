import type { IconPresentation } from "../../presentation/contracts/index.js";
import type { iconNodeKinds } from "../constants/icon-node-kinds.constant.js";

/**
 * @description Portable line geometry and its explicit presentation.
 */
export interface IconLineNode extends IconPresentation {
  /**
   * @description Discriminator identifying line geometry.
   */
  readonly kind: typeof iconNodeKinds.line;

  /**
   * @description Finite horizontal start coordinate.
   */
  readonly x1: number;

  /**
   * @description Finite vertical start coordinate.
   */
  readonly y1: number;

  /**
   * @description Finite horizontal end coordinate.
   */
  readonly x2: number;

  /**
   * @description Finite vertical end coordinate.
   */
  readonly y2: number;
}
