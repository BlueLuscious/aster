import type {
  CollectionDefinition,
  IconDefinition,
} from "@aster/core";
import type {
  CatalogueCollectionRecord,
  CatalogueIconRecord,
  CatalogueProvider,
  CatalogueSnapshot,
} from "../contracts/index.js";

/**
 * @description Lazily adapts canonical Aster definitions into one explicit catalogue snapshot.
 */
export class AsterCatalogueProvider implements CatalogueProvider {
  /**
   * @description Canonical built-in provider identity.
   */
  readonly identity = "aster";

  /**
   * @description Loads the canonical Aster collection only after explicit provider execution.
   * @returns Immutable snapshot derived from canonical `@aster/icons` values.
   */
  async load(): Promise<CatalogueSnapshot> {
    const { AsterCollection } = await import("@aster/icons");
    return this.#createSnapshot(AsterCollection);
  }

  /**
   * @description Derives independent icon records and collection membership from one collection.
   * @param collection - Canonical portable Aster collection.
   * @returns Immutable provider snapshot without changing portable definitions.
   */
  #createSnapshot(collection: CollectionDefinition): CatalogueSnapshot {
    const collectionRecord: CatalogueCollectionRecord = Object.freeze({
      definition: collection,
    });
    const icons: CatalogueIconRecord[] = collection.icons.map(
      (definition: IconDefinition) => Object.freeze({
        definition,
        memberships: Object.freeze([collection.identity]),
      }),
    );

    return Object.freeze({
      icons: Object.freeze(icons),
      collections: Object.freeze([collectionRecord]),
    });
  }
}
