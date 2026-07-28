import type { IconPresentation } from "../../presentation/contracts/index.js";

/**
 * @description Portable canonical path geometry and its explicit presentation.
 */
export interface IconPathNode extends IconPresentation {
  /**
   * @description Discriminator identifying path geometry.
   */
  readonly kind: "path";

  /**
   * @description Canonical syntax-validated SVG path data.
   */
  readonly data: string;
}
