import type {
  CollectionDefinition,
  CollectionIdentity,
  IconDefinition,
  IconIdentity,
} from "@luscious-garden/aster-core";
import type {
  CatalogueDiscovery,
  CatalogueProvider,
} from "../contracts/index.js";
import { AsterCatalogueProvider } from "../runtime/aster-catalogue.provider.js";

/**
 * @description Internal built-in provider owned by the public catalogue API boundary.
 */
const asterCatalogueProvider = new AsterCatalogueProvider();

/**
 * @description Immutable explicit provider for canonical `@luscious-garden/aster-icons` discovery and exact
 * loading.
 */
export const AsterCatalogue: CatalogueProvider = Object.freeze({
  /** @description Stable identity of the canonical Aster catalogue provider. */
  identity: asterCatalogueProvider.identity,

  /**
   * @description Discovers isolated canonical Aster metadata without definition evaluation.
   * @returns Complete built-in Aster discovery metadata.
   */
  async discover(): Promise<CatalogueDiscovery> {
    return asterCatalogueProvider.discover();
  },

  /**
   * @description Loads one exact canonical Aster icon definition.
   * @param identity - Complete selected icon identity.
   * @returns Canonical definition or no value when unavailable.
   */
  async loadIcon(identity: IconIdentity): Promise<IconDefinition | undefined> {
    return asterCatalogueProvider.loadIcon(identity);
  },

  /**
   * @description Loads one exact canonical Aster collection definition.
   * @param identity - Complete selected collection identity.
   * @returns Canonical definition or no value when unavailable.
   */
  async loadCollection(
    identity: CollectionIdentity,
  ): Promise<CollectionDefinition | undefined> {
    return asterCatalogueProvider.loadCollection(identity);
  },
});
