import type {
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
} from "../../contracts/index.js";

/**
 * @description Internal isolated discovery state associated with one provider identity.
 */
export type TAcceptedCatalogueDiscovery = Readonly<{
  /** @description Canonical provider identity. */
  identity: string;

  /** @description Canonically ordered accepted icon discovery records. */
  icons: readonly CatalogueDiscoveryIconRecord[];

  /** @description Canonically ordered accepted collection discovery records. */
  collections: readonly CatalogueDiscoveryCollectionRecord[];
}>;
