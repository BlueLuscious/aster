import type { IconDefinition } from "../../definition/contracts/index.js";
import type { CollectionIdentity } from "./collection-identity.contract.js";
import type { CollectionMetadata } from "./collection-metadata.contract.js";

/**
 * @description Complete immutable collection with direct portable icon membership.
 */
export interface CollectionDefinition {
  /**
   * @description Stable collection identity independent of its members.
   */
  readonly identity: CollectionIdentity;

  /**
   * @description Ordered unique icon definitions retained by this collection.
   */
  readonly icons: readonly IconDefinition[];

  /**
   * @description Collection-owned descriptive and redistribution metadata.
   */
  readonly metadata: CollectionMetadata;
}
