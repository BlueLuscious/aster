import type { IconDefinition } from "../../definition/contracts/index.js";

/**
 * @description Public immutable authority for constructing portable icon definitions.
 */
export interface IconApi {
  /**
   * @description Reuses a recognised canonical output or validates and isolates authored data.
   * @remarks Only exact outputs constructed by the same loaded Core copy are recognised.
   * Unknown values, including compatible foreign outputs, still require complete validation.
   * @param definition - Authored render-neutral data or an existing canonical definition.
   * @returns Recognised input or newly constructed deeply frozen icon definition.
   */
  define(definition: IconDefinition): IconDefinition;

  /**
   * @description Validates a treatment slug and derives its portable dictionary property name.
   * @remarks The operation neither selects a definition nor reserves a property globally.
   * @param variant - Explicit treatment slug, normalised consistently with definition identity.
   * @returns Lower camel-case property name, including valid digit-led values for bracket access.
   */
  variantPropertyName(variant: string): string;
}
