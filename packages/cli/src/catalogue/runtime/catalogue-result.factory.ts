import { catalogueResultKinds } from "../constants/catalogue-result-kinds.constant.js";
import type {
  CatalogueCollectionResult,
  CatalogueDiscoveryCollectionRecord,
  CatalogueDiscoveryIconRecord,
  CatalogueIconResult,
  CatalogueProviderResult,
} from "../contracts/index.js";
import type { TAcceptedCatalogueDiscovery } from "../types/internal/accepted-catalogue-discovery.type.js";

/**
 * @description Projects accepted provider records into immutable public discovery results.
 */
export class CatalogueResultFactory {
  /**
   * @description Creates one provider summary from an accepted catalogue.
   * @param catalogue - Accepted provider catalogue.
   * @returns Immutable provider identity and record counts.
   */
  provider(catalogue: TAcceptedCatalogueDiscovery): CatalogueProviderResult {
    return Object.freeze({
      identity: catalogue.identity,
      iconCount: catalogue.icons.length,
      collectionCount: catalogue.collections.length,
    });
  }

  /**
   * @description Creates one icon result from an accepted provider record.
   * @param catalogue - Supplying provider identity.
   * @param record - Accepted icon record.
   * @returns Immutable icon identity, metadata, and membership evidence.
   */
  icon(
    catalogue: string,
    record: CatalogueDiscoveryIconRecord,
  ): CatalogueIconResult {
    return Object.freeze({
      kind: catalogueResultKinds.icon,
      catalogue,
      identity: record.identity,
      metadata: record.metadata,
      memberships: Object.freeze([...record.memberships]),
    });
  }

  /**
   * @description Creates one collection result from accepted discovery metadata.
   * @param catalogue - Supplying provider identity.
   * @param record - Accepted collection discovery record.
   * @returns Immutable collection identity, metadata, and member evidence.
   */
  collection(
    catalogue: string,
    record: CatalogueDiscoveryCollectionRecord,
  ): CatalogueCollectionResult {
    return Object.freeze({
      kind: catalogueResultKinds.collection,
      catalogue,
      identity: record.identity,
      metadata: record.metadata,
      icons: Object.freeze([...record.icons]),
    });
  }
}
