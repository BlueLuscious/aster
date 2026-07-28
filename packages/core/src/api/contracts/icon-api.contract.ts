import type { IconDefinition } from "../../definition/contracts/index.js";

/**
 * @description Public immutable authority for constructing portable icon definitions.
 */
export interface IconApi {
  /**
   * @description Validates authored data and creates an isolated deeply frozen definition.
   * @param definition - Authored render-neutral definition object.
   * @returns Canonical deeply frozen icon definition.
   */
  define(definition: IconDefinition): IconDefinition;
}
