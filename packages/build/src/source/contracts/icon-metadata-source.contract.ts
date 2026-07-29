import type { IconIdentity } from "@aster/core";
import type { CanonicalTextSource } from "./canonical-text-source.contract.js";

/**
 * @description Canonical textual metadata associated with one logical icon identity.
 */
export interface IconMetadataSource extends CanonicalTextSource {
  /**
   * @description Discriminator for icon-level metadata.
   */
  readonly kind: "icon-metadata";

  /**
   * @description Identity established independently from metadata contents.
   */
  readonly identity: IconIdentity;
}
