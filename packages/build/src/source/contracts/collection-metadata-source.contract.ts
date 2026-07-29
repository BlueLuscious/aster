import type { ingestionSourceKinds } from "../constants/ingestion-source-kinds.constant.js";
import type { CanonicalTextSource } from "./canonical-text-source.contract.js";

/**
 * @description Canonical textual metadata owned by one collection.
 */
export interface CollectionMetadataSource extends CanonicalTextSource {
  /**
   * @description Discriminator for collection-level metadata.
   */
  readonly kind: typeof ingestionSourceKinds.collectionMetadata;

  /**
   * @description Canonical collection slug owning the metadata.
   */
  readonly collection: string;
}
