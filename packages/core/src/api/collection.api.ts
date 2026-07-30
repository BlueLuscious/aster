import type { CollectionDefinition } from "../collection/contracts/index.js";
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
   * @param definition - Authored render-neutral collection object.
   * @returns Canonical deeply frozen collection definition.
   */
  define(definition: CollectionDefinition): CollectionDefinition {
    return collectionDefinitionFactory.create(definition);
  },
});
