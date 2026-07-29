import type { CanonicalTextSource } from "./canonical-text-source.contract.js";
import type { SourceIdentity } from "./source-identity.contract.js";

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
  readonly identity: SourceIdentity;
}
