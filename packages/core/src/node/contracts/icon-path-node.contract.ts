import type { IconPresentation } from "../../presentation/contracts/index.js";
import type { iconNodeKinds } from "../constants/icon-node-kinds.constant.js";

/**
 * @description Portable canonical path geometry and its explicit presentation.
 */
export interface IconPathNode extends IconPresentation {
  /**
   * @description Discriminator identifying path geometry.
   */
  readonly kind: typeof iconNodeKinds.path;

  /**
   * @description Non-empty SVG path data accepted from an authoritative ingestion boundary.
   * @remarks Core trims this value but does not parse path syntax; distributable definitions must
   * be produced through a pipeline that validates and canonicalises the path.
   */
  readonly data: string;
}
