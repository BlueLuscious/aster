import type { IExistingGeneratedFile } from "../contracts/internal/existing-generated-file.contract.js";
import type { IPlannedFile } from "../contracts/internal/planned-file.contract.js";
import type { TGeneratedCleanupPlan } from "../types/internal/generated-cleanup-plan.type.js";
import { GeneratedFileOwnershipInspector } from "./generated-file-ownership.inspector.js";

/**
 * @description Finds stale owned files and protects unowned planned output paths.
 */
export class GeneratedCleanupPlanner {
  /**
   * @description Generated text-format ownership authority.
   */
  readonly #ownershipInspector = new GeneratedFileOwnershipInspector();

  /**
   * @description Analyses an existing generated-root snapshot without performing cleanup.
   * @param existingFiles - Canonical existing text-file snapshot.
   * @param plannedFiles - Complete new generated file set.
   * @returns Frozen stale and conflicting generated-root-relative paths.
   */
  plan(
    existingFiles: readonly IExistingGeneratedFile[],
    plannedFiles: readonly IPlannedFile[],
  ): TGeneratedCleanupPlan {
    const plannedPaths = new Set(plannedFiles.map((file) => file.path));
    const stalePaths = existingFiles
      .filter(
        (file) =>
          !plannedPaths.has(file.path) &&
          this.#ownershipInspector.isOwned(file),
      )
      .map((file) => file.path)
      .sort((left, right) => this.#compareText(left, right));
    const conflictingPaths = existingFiles
      .filter(
        (file) =>
          plannedPaths.has(file.path) &&
          !this.#ownershipInspector.isOwned(file),
      )
      .map((file) => file.path)
      .sort((left, right) => this.#compareText(left, right));

    return Object.freeze({
      stalePaths: Object.freeze(stalePaths),
      conflictingPaths: Object.freeze(conflictingPaths),
    });
  }

  /**
   * @description Compares text by Unicode code-unit order.
   * @param left - First text value.
   * @param right - Second text value.
   * @returns Negative, zero, or positive ordering value.
   */
  #compareText(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
