import type {
  CollectionIdentity,
  CollectionMetadata,
} from "@aster/core";

/**
 * @description Lightweight searchable metadata for one distributed icon collection.
 * @remarks Member keys preserve authored order without embedding complete icon definitions.
 */
export interface CollectionManifestEntry {
  /** @description Canonical textual identity used by discovery and dynamic loading. */
  readonly key: string;

  /** @description Complete portable collection identity. */
  readonly identity: CollectionIdentity;

  /** @description Named export exposed by the collection's public definition subpath. */
  readonly symbol: string;

  /** @description Complete descriptive collection metadata. */
  readonly metadata: CollectionMetadata;

  /** @description Ordered canonical icon keys retained by the collection. */
  readonly members: readonly string[];
}
