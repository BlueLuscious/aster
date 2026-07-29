import type { IconPresentation } from "../../presentation/contracts/index.js";
import type { iconNodeKinds } from "../constants/icon-node-kinds.constant.js";
import type { IconPoint } from "./icon-point.contract.js";

/**
 * @description Portable open coordinate sequence and its explicit presentation.
 */
export interface IconPolylineNode extends IconPresentation {
  /**
   * @description Discriminator identifying polyline geometry.
   */
  readonly kind: typeof iconNodeKinds.polyline;

  /**
   * @description Ordered sequence containing at least two finite coordinate pairs.
   */
  readonly points: readonly IconPoint[];
}
