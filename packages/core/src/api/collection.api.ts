import type {
  CollectionDefinition,
  CollectionDefinitionInput,
  CollectionIconMap,
} from "../collection/contracts/index.js";
import { CollectionDefinitionFactory } from "../collection/runtime/collection-definition.factory.js";
import type { CollectionApi } from "./contracts/index.js";

/**
 * @description Shared internal factory owned by the public Collection API boundary.
 */
const collectionDefinitionFactory = new CollectionDefinitionFactory();

/**
 * @description Immutable public object for defining portable icon collections.
 */
export const Collection: CollectionApi = Object.freeze({
  /**
   * @description Validates authored data and creates an immutable collection.
   * @param input - Authored render-neutral collection object or complete definition to revalidate.
   * @returns Canonical deeply frozen collection definition retaining concrete aliases.
   * @typeParam TIconMap - Concrete collection-local icon alias map.
   */
  define<TIconMap extends CollectionIconMap>(
    input: CollectionDefinitionInput<TIconMap>,
  ): CollectionDefinition<TIconMap> {
    return collectionDefinitionFactory.create<TIconMap>(input);
  },
});
