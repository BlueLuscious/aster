import type { CollectionDefinition } from "@aster/core";
import { catalogueResultKinds } from "../constants/catalogue-result-kinds.constant.js";
import type {
  CatalogueCollectionResult,
  CatalogueIconRecord,
  CatalogueIconResult,
  CatalogueProviderResult,
} from "../contracts/index.js";
import type { TAcceptedCatalogue } from "../types/internal/accepted-catalogue.type.js";

/**
 * @description Projects accepted provider records into immutable public discovery results.
 */
export class CatalogueResultFactory {
  /**
   * @description Creates one provider summary from an accepted catalogue.
   * @param catalogue - Accepted provider catalogue.
   * @returns Immutable provider identity and record counts.
   */
  provider(catalogue: TAcceptedCatalogue): CatalogueProviderResult {
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
  icon(catalogue: string, record: CatalogueIconRecord): CatalogueIconResult {
    return Object.freeze({
      kind: catalogueResultKinds.icon,
      catalogue,
      identity: record.definition.identity,
      metadata: record.definition.metadata,
      memberships: Object.freeze([...record.memberships]),
    });
  }

  /**
   * @description Creates one collection result from an accepted portable definition.
   * @param catalogue - Supplying provider identity.
   * @param definition - Accepted portable collection.
   * @returns Immutable collection identity, metadata, and member evidence.
   */
  collection(
    catalogue: string,
    definition: CollectionDefinition,
  ): CatalogueCollectionResult {
    return Object.freeze({
      kind: catalogueResultKinds.collection,
      catalogue,
      identity: definition.identity,
      metadata: definition.metadata,
      icons: Object.freeze(definition.icons.map((icon) => icon.identity)),
    });
  }
}
