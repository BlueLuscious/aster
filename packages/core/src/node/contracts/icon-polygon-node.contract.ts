import type { IconPresentation } from "../../presentation/contracts/index.js";
import type { iconNodeKinds } from "../constants/icon-node-kinds.constant.js";
import type { IconPoint } from "./icon-point.contract.js";

/**
 * @description Portable closed coordinate sequence and its explicit presentation.
 */
export interface IconPolygonNode extends IconPresentation {
  /**
   * @description Discriminator identifying polygon geometry.
   */
  readonly kind: typeof iconNodeKinds.polygon;

  /**
   * @description Ordered sequence containing at least three finite coordinate pairs.
   */
  readonly points: readonly IconPoint[];
}
