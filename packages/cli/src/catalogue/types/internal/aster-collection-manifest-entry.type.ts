import type {
  CollectionIdentity,
  CollectionMetadata,
} from "@aster/core";

/**
 * @description Internal structural view of one built-in collection manifest entry.
 */
export type TAsterCollectionManifestEntry = Readonly<{
  /** @description Canonical textual collection key. */
  key: string;
  /** @description Complete portable collection identity. */
  identity: CollectionIdentity;
  /** @description Complete descriptive collection metadata. */
  metadata: CollectionMetadata;
  /** @description Ordered canonical keys of retained icons. */
  members: readonly string[];
}>;
