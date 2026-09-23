import type { IconDefinition } from "../../definition/contracts/index.js";

/**
 * @description Authored collection-local aliases mapped to portable icon definitions.
 * @remarks Concrete collection inputs retain their exact alias keys through `Collection.define()`.
 */
export interface CollectionIconMap {
  /**
   * @description Portable icon definition authored under one collection-local alias.
   */
  readonly [alias: string]: IconDefinition;
}
