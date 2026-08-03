import type {
  CollectionIdentity,
  IconDefinition,
} from "@aster/core";

/**
 * @description Catalogue-owned discovery record for one portable icon definition.
 */
export interface CatalogueIconRecord {
  /**
   * @description Portable icon value retained without reconstruction or decoration.
   */
  readonly definition: IconDefinition;

  /**
   * @description Independent collections that explicitly retain this icon.
   */
  readonly memberships: readonly CollectionIdentity[];

  /**
   * @description Optional provider-owned canonical terms outside portable metadata.
   */
  readonly searchTerms?: readonly string[];
}
