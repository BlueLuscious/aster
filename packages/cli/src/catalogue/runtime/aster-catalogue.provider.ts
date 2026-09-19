import type {
  CatalogueProvider,
  CatalogueSnapshot,
} from "../contracts/index.js";
import { AsterCatalogueSnapshotFactory } from "./aster-catalogue-snapshot.factory.js";

/**
 * @description Lazily adapts canonical Aster definitions into one explicit catalogue snapshot.
 */
export class AsterCatalogueProvider implements CatalogueProvider {
  /**
   * @description Canonical Icons definition adaptation authority.
   */
  readonly #snapshots = new AsterCatalogueSnapshotFactory();

  /**
   * @description Canonical built-in provider identity.
   */
  readonly identity = "aster";

  /**
   * @description Deliberately invokes every canonical loader only after explicit provider execution.
   * @returns Immutable snapshot derived from canonical `@aster/icons` values.
   */
  async load(): Promise<CatalogueSnapshot> {
    const { AsterCollectionLoaders, AsterIconLoaders } = await import(
      "@aster/icons/dynamic"
    );
    const [icons, collections] = await Promise.all([
      this.#loadAll(AsterIconLoaders),
      this.#loadAll(AsterCollectionLoaders),
    ]);

    return this.#snapshots.create(icons, collections);
  }

  /**
   * @description Invokes one complete generated loader family in canonical key order.
   * @typeParam TDefinition - Portable definition resolved by the loader family.
   * @param loaders - Exact generated loaders selected for complete snapshot compatibility.
   * @returns Immutable sequence containing every resolved canonical definition.
   */
  async #loadAll<TDefinition>(
    loaders: Readonly<
      Record<string, (() => Promise<TDefinition>) | undefined>
    >,
  ): Promise<readonly TDefinition[]> {
    const definitions = await Promise.all(
      Object.values(loaders).map((loader) => {
        if (loader === undefined) {
          throw new TypeError("Generated catalogue loader is unavailable.");
        }

        return loader();
      }),
    );

    return Object.freeze(definitions);
  }
}
