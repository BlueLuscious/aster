import type { IconIdentity } from "@aster/core";
import type { CanonicalTextSource } from "./canonical-text-source.contract.js";

/**
 * @description Canonical exported SVG associated with one accepted logical icon identity.
 */
export interface CanonicalSvgSource extends CanonicalTextSource {
  /**
   * @description Discriminator for canonical SVG artwork.
   */
  readonly kind: "svg";

  /**
   * @description Identity established independently from SVG document contents.
   */
  readonly identity: IconIdentity;
}
