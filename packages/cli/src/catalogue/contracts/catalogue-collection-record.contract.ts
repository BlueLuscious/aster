import type { CollectionDefinition } from "@aster/core";

/**
 * @description Catalogue-owned discovery record for one portable collection definition.
 */
export interface CatalogueCollectionRecord {
  /**
   * @description Portable collection candidate supplied for validation and isolation by the loader.
   */
  readonly definition: CollectionDefinition;

  /**
   * @description Optional provider-owned canonical terms outside portable metadata.
   */
  readonly searchTerms?: readonly string[];
}
