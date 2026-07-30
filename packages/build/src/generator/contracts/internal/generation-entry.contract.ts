import type { IconDefinition } from "@aster/core";

/**
 * @description One portable definition and its canonical metadata provenance.
 */
export interface IGenerationEntry {
  /**
   * @description Complete canonical source identifiers responsible for the definition.
   */
  readonly sourceIds: readonly [string, ...string[]];

  /**
   * @description Complete immutable portable definition to emit.
   */
  readonly definition: IconDefinition;
}
