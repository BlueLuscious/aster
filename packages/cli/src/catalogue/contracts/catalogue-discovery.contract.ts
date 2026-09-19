import type { CatalogueDiscoveryCollectionRecord } from "./catalogue-discovery-collection-record.contract.js";
import type { CatalogueDiscoveryIconRecord } from "./catalogue-discovery-icon-record.contract.js";

/**
 * @description Complete metadata-only catalogue state discovered for one command execution.
 */
export interface CatalogueDiscovery {
  /** @description Icon records that contain no geometry or complete definitions. */
  readonly icons: readonly CatalogueDiscoveryIconRecord[];

  /** @description Collection records whose members are represented only by identity. */
  readonly collections: readonly CatalogueDiscoveryCollectionRecord[];
}
