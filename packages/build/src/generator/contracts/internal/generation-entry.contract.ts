import type { IconDefinition } from "@aster/core";

/**
 * @description One portable definition and its canonical metadata provenance.
 */
export interface IGenerationEntry {
  /**
   * @description Canonical metadata source identifier responsible for the definition.
   */
  readonly sourceId: string;

  /**
   * @description Complete immutable portable definition to emit.
   */
  readonly definition: IconDefinition;
}
