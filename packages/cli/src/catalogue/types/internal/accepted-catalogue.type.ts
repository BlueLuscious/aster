import type {
  CatalogueCollectionRecord,
  CatalogueIconRecord,
} from "../../contracts/index.js";

/**
 * @description Internal isolated and validated snapshot associated with one provider identity.
 */
export type TAcceptedCatalogue = Readonly<{
  /**
   * @description Canonical provider identity.
   */
  identity: string;

  /**
   * @description Canonically ordered accepted icon records.
   */
  icons: readonly CatalogueIconRecord[];

  /**
   * @description Canonically ordered accepted collection records.
   */
  collections: readonly CatalogueCollectionRecord[];
}>;
