import type {
  CollectionDefinition,
  CollectionDefinitionInput,
  CollectionIconMap,
} from "../../collection/contracts/index.js";

/**
 * @description Public immutable authority for constructing portable collections.
 */
export interface CollectionApi {
  /**
   * @description Validates authored data and creates an isolated immutable collection.
   * @param input - Authored render-neutral collection object or complete definition to revalidate.
   * @returns Canonical deeply frozen collection definition retaining concrete aliases.
   * @typeParam TIconMap - Concrete collection-local icon alias map.
   */
  define<TIconMap extends CollectionIconMap>(
    input: CollectionDefinitionInput<TIconMap>,
  ): CollectionDefinition<TIconMap>;
}
