import type {
  CollectionDefinition,
  CollectionIdentity,
  IconDefinition,
  IconIdentity,
} from "@luscious-garden/aster-core";
import type { CatalogueDiscovery } from "./catalogue-discovery.contract.js";

/**
 * @description Explicit host-supplied source of discovery metadata and exact definitions.
 */
export interface CatalogueProvider {
  /**
   * @description Canonical ASCII lowercase kebab-case provider identity.
   */
  readonly identity: string;

  /**
   * @description Discovers immutable metadata without evaluating complete definitions.
   * @returns Complete provider-owned discovery state for the current execution.
   */
  discover(): Promise<CatalogueDiscovery>;

  /**
   * @description Loads one exact icon definition after discovery selection.
   * @param identity - Complete selected icon identity.
   * @returns Provider-owned definition or no value when unavailable.
   */
  loadIcon(identity: IconIdentity): Promise<IconDefinition | undefined>;

  /**
   * @description Loads one exact collection definition after discovery selection.
   * @param identity - Complete selected collection identity.
   * @returns Provider-owned definition or no value when unavailable.
   */
  loadCollection(
    identity: CollectionIdentity,
  ): Promise<CollectionDefinition | undefined>;
}
