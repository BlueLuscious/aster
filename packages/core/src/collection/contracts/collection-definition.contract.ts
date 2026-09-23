import type { IconDefinition } from "../../definition/contracts/index.js";
import type { CollectionDefinitionInput } from "./collection-definition-input.contract.js";
import type { CollectionIconMap } from "./collection-icon-map.contract.js";

/**
 * @description Complete immutable collection with keyed and ordered portable icon membership.
 * @typeParam TIconMap - Concrete collection-local icon alias map.
 */
export interface CollectionDefinition<
  TIconMap extends CollectionIconMap = CollectionIconMap,
> extends CollectionDefinitionInput<TIconMap> {
  /**
   * @description Frozen canonical alias map retained by this collection.
   */
  readonly icons: Readonly<TIconMap>;

  /**
   * @description Ordered unique icon definitions derived from the alias map.
   */
  readonly members: readonly IconDefinition[];
}
