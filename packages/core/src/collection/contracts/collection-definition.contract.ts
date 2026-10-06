import type { IconDefinition } from "../../definition/contracts/index.js";
import type { CollectionDefinitionInput } from "./collection-definition-input.contract.js";
import type { CollectionIconMap } from "./collection-icon-map.contract.js";

/**
 * @description Complete immutable collection with keyed and ordered portable icon membership.
 * @remarks Alias keys are preserved, but member values use the canonical icon contract rather
 * than authored mutable or literal subtypes that reconstruction may change.
 * @typeParam TIconMap - Concrete collection-local icon alias map.
 */
export interface CollectionDefinition<
  TIconMap extends CollectionIconMap = CollectionIconMap,
> extends Omit<CollectionDefinitionInput<TIconMap>, "icons"> {
  /**
   * @description Frozen canonical alias map retained by this collection.
   */
  readonly icons: {
    readonly [Alias in keyof TIconMap]: IconDefinition;
  };

  /**
   * @description Ordered unique icon definitions derived from the alias map.
   */
  readonly members: readonly IconDefinition[];
}
