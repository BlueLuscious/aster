import type {
  CollectionIdentity,
  CollectionMetadata,
  IconIdentity,
} from "@aster/core";

/**
 * @description Provider-owned metadata record for one discoverable collection identity.
 */
export interface CatalogueDiscoveryCollectionRecord {
  /** @description Complete portable collection identity. */
  readonly identity: CollectionIdentity;

  /** @description Complete descriptive collection metadata. */
  readonly metadata: CollectionMetadata;

  /** @description Ordered identities of icons directly retained by the collection. */
  readonly icons: readonly IconIdentity[];

  /** @description Optional provider-owned canonical terms outside portable metadata. */
  readonly searchTerms?: readonly string[];
}
