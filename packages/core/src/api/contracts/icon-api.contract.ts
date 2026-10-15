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
}
