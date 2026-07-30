import type { CollectionBuildFile } from "./collection-build-file.contract.js";

/**
 * @description Complete successful collection output ready for an effectful host transaction.
 */
export interface CollectionBuildOutput {
  /**
   * @description Canonical collection slug represented by the output.
   */
  readonly collection: string;

  /**
   * @description Canonical generated package name.
   */
  readonly packageName: string;

  /**
   * @description Complete canonically ordered generated text files.
   */
  readonly files: readonly CollectionBuildFile[];

  /**
   * @description Explicitly owned existing files absent from the new output.
   */
  readonly stalePaths: readonly string[];
}
