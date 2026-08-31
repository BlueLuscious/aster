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
   * @description Canonical Icons index adaptation authority.
   */
  readonly #snapshots = new AsterCatalogueSnapshotFactory();

  /**
   * @description Canonical built-in provider identity.
   */
  readonly identity = "aster";

  /**
   * @description Loads canonical Aster indexes only after explicit provider execution.
   * @returns Immutable snapshot derived from canonical `@aster/icons` values.
   */
  async load(): Promise<CatalogueSnapshot> {
    const [{ AsterIcons }, { AsterCollections }] = await Promise.all([
      import("@aster/icons"),
      import("@aster/icons/collections"),
    ]);
    return this.#snapshots.create(AsterIcons, AsterCollections);
  }
}
