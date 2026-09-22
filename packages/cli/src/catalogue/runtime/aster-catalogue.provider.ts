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
import { AsterCatalogueDiscoveryFactory } from "./aster-catalogue-discovery.factory.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Lazily adapts canonical Aster manifests and exact definition loaders.
 */
export class AsterCatalogueProvider implements CatalogueProvider {
  /** @description Canonical Icons manifest adaptation authority. */
  readonly #discoveries = new AsterCatalogueDiscoveryFactory();

  /** @description Canonical identity formatter used to address generated loader maps. */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Canonical built-in provider identity.
   */
  readonly identity = "aster";

  /**
   * @description Imports only canonical metadata manifests after explicit provider execution.
   * @returns Immutable discovery derived without evaluating definition modules.
   */
  async discover(): Promise<CatalogueDiscovery> {
    const { AsterCollectionManifest, AsterIconManifest } = await import(
      "@luscious-garden/aster-icons/manifest"
    );

    return this.#discoveries.create(AsterIconManifest, AsterCollectionManifest);
  }

  /**
   * @description Invokes one exact canonical icon loader.
   * @param identity - Complete selected icon identity.
   * @returns Canonical definition or no value when its exact loader is absent.
   */
  async loadIcon(identity: IconIdentity): Promise<IconDefinition | undefined> {
    const { AsterIconLoaders } = await this.#definitionLoaders();
    return AsterIconLoaders[this.#identities.icon(identity)]?.();
  }

  /**
   * @description Invokes one exact canonical collection loader.
   * @param identity - Complete selected collection identity.
   * @returns Canonical definition or no value when its exact loader is absent.
   */
  async loadCollection(
    identity: CollectionIdentity,
  ): Promise<CollectionDefinition | undefined> {
    const { AsterCollectionLoaders } = await this.#definitionLoaders();
    return AsterCollectionLoaders[this.#identities.collection(identity)]?.();
  }

  /**
   * @description Acquires generated exact definition loaders only after exact loading is invoked.
   * @returns Canonical icon and collection loader maps.
   */
  async #definitionLoaders(): Promise<typeof import("@luscious-garden/aster-icons/dynamic")> {
    return import("@luscious-garden/aster-icons/dynamic");
  }
}
