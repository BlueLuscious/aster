import type {
  CollectionIdentity,
  IconIdentity,
} from "@aster/core";
import type { CatalogueIconMetadata } from "./catalogue-icon-metadata.contract.js";

/**
 * @description Provider-owned metadata record for one discoverable icon identity.
 */
export interface CatalogueDiscoveryIconRecord {
  /** @description Complete portable icon identity. */
  readonly identity: IconIdentity;

  /** @description Lightweight searchable metadata independent from artwork evaluation. */
  readonly metadata: CatalogueIconMetadata;

  /** @description Independent collections that explicitly retain this icon. */
  readonly memberships: readonly CollectionIdentity[];

  /** @description Optional provider-owned canonical terms outside portable metadata. */
  readonly searchTerms?: readonly string[];
}
