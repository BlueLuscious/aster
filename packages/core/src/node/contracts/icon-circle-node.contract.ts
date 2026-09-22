import type { IconPresentation } from "../../presentation/contracts/index.js";
import type { iconNodeKinds } from "../constants/icon-node-kinds.constant.js";

/**
 * @description Portable circle geometry and its explicit presentation.
 */
export interface IconCircleNode extends IconPresentation {
  /**
   * @description Discriminator identifying circle geometry.
   */
  readonly kind: typeof iconNodeKinds.circle;

  /**
   * @description Finite horizontal centre coordinate.
   */
  readonly cx: number;

  /**
   * @description Finite vertical centre coordinate.
   */
  readonly cy: number;

  /**
   * @description Positive finite radius.
   */
  readonly radius: number;
}
