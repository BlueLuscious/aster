import type {
  CatalogueProvider,
  CatalogueSnapshot,
} from "../contracts/index.js";
import { AsterCatalogueProvider } from "../runtime/aster-catalogue.provider.js";

/**
 * @description Internal built-in provider owned by the public catalogue API boundary.
 */
const asterCatalogueProvider = new AsterCatalogueProvider();

/**
 * @description Immutable explicit provider for canonical `@aster/icons` catalogue discovery.
 */
export const AsterCatalogue: CatalogueProvider = Object.freeze({
  identity: asterCatalogueProvider.identity,

  /**
   * @description Loads one isolated immutable snapshot of canonical Aster definitions.
   * @returns Complete built-in Aster catalogue snapshot.
   */
  async load(): Promise<CatalogueSnapshot> {
    return asterCatalogueProvider.load();
  },
});
