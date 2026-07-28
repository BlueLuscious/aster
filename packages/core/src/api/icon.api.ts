import type { IconDefinition } from "../definition/contracts/index.js";
import { IconDefinitionFactory } from "../definition/runtime/icon-definition.factory.js";
import type { IconApi } from "./contracts/index.js";

/**
 * @description Shared internal factory owned by the public Core API boundary.
 */
const iconDefinitionFactory = new IconDefinitionFactory();

/**
 * @description Immutable public object for defining portable icons.
 */
export const Icon: IconApi = Object.freeze({
  /**
   * @description Validates authored data and creates an isolated deeply frozen definition.
   * @param definition - Authored render-neutral definition object.
   * @returns Canonical deeply frozen icon definition.
   */
  define(definition: IconDefinition): IconDefinition {
    return iconDefinitionFactory.create(definition);
  },
});
