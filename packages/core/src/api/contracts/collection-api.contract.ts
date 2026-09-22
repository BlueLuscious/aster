import type { CollectionDefinition } from "../../collection/contracts/index.js";

/**
 * @description Public immutable authority for constructing portable collections.
 */
export interface CollectionApi {
  /**
   * @description Validates authored data and creates an isolated immutable collection.
   * @param definition - Authored render-neutral collection object.
   * @returns Canonical deeply frozen collection definition.
   */
  define(definition: CollectionDefinition): CollectionDefinition;
}
