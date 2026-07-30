import type { IExistingGeneratedFile } from "./existing-generated-file.contract.js";
import type { IGenerationEntry } from "./generation-entry.contract.js";

/**
 * @description Complete pure generation-planning input supplied after successful normalisation.
 */
export interface IGenerationRequest {
  /**
   * @description Canonical collection metadata source identifier.
   */
  readonly collectionSourceId: string;

  /**
   * @description Canonical collection slug shared by every definition.
   */
  readonly collection: string;

  /**
   * @description Intended generated collection package name.
   */
  readonly packageName: string;

  /**
   * @description Portable definitions and their canonical metadata provenance.
   */
  readonly entries: readonly IGenerationEntry[];

  /**
   * @description Optional snapshot of existing text files beneath the configured generated root.
   */
  readonly existingFiles?: readonly IExistingGeneratedFile[];
}
