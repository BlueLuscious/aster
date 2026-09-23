import type { CollectionIconMap } from "./collection-icon-map.contract.js";
import type { CollectionIdentity } from "./collection-identity.contract.js";
import type { CollectionMetadata } from "./collection-metadata.contract.js";

/**
 * @description Authored collection fields accepted before ordered membership is derived.
 * @typeParam TIconMap - Concrete collection-local icon alias map.
 */
export interface CollectionDefinitionInput<
  TIconMap extends CollectionIconMap = CollectionIconMap,
> {
  /**
   * @description Stable collection identity independent of its members.
   */
  readonly identity: CollectionIdentity;

  /**
   * @description Sole authored alias and membership authority in deterministic property order.
   */
  readonly icons: TIconMap;

  /**
   * @description Collection-owned descriptive and redistribution metadata.
   */
  readonly metadata: CollectionMetadata;
}
