import type { IconDefinition } from "../definition/contracts/index.js";
import { IconDefinitionFactory } from "../definition/runtime/icon-definition.factory.js";
import { IconIdentityNormaliser } from "../definition/runtime/icon-identity.normaliser.js";
import type { IconApi } from "./contracts/index.js";

/**
 * @description Shared internal factory owned by the public Core API boundary.
 */
const iconDefinitionFactory = new IconDefinitionFactory();

/** @description Treatment-property naming authority owned by the public Icon API. */
const iconIdentityNormaliser = new IconIdentityNormaliser();

/**
 * @description Immutable public object for defining portable icons.
 */
export const Icon: IconApi = Object.freeze({
  /**
   * @description Reuses a recognised canonical output or validates and isolates authored data.
   * @param definition - Authored render-neutral data or an existing canonical definition.
   * @returns Recognised input or newly constructed deeply frozen icon definition.
   */
  define(definition: IconDefinition): IconDefinition {
    return iconDefinitionFactory.create(definition);
  },
  /**
   * @description Validates a treatment slug and derives its canonical dictionary property name.
   * @param variant - Candidate explicit treatment slug.
   * @returns Portable property name without loading or selecting a definition.
   */
  variantPropertyName(variant: string): string {
    return iconIdentityNormaliser.variantPropertyName(variant);
  },
});
