import type { CatalogueCollectionRecord } from "./catalogue-collection-record.contract.js";
import type { CatalogueIconRecord } from "./catalogue-icon-record.contract.js";

/**
 * @description Complete immutable provider-owned catalogue state loaded for one execution.
 */
export interface CatalogueSnapshot {
  /**
   * @description Icon discovery records independent from collection ownership.
   */
  readonly icons: readonly CatalogueIconRecord[];

  /**
   * @description Collection discovery records independent from icon identity.
   */
  readonly collections: readonly CatalogueCollectionRecord[];
}
