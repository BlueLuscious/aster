import { basename, resolve } from "node:path";
import { reviewDocumentSchema } from "../../../review/constants/review-document-schema.constant.js";
import type { TReviewOutputLocation } from "../types/internal/review-output-location.type.js";
import { OutputLocationResolver } from "./output-location.resolver.js";

/**
 * @description Resolves one static review document beneath shared safe output roots.
 */
export class ReviewOutputPathResolver {
  /**
   * @description Shared output-root resolution authority.
   */
  readonly #locations: OutputLocationResolver;

  /**
   * @description Creates one resolver from the shared root boundary.
   * @param locations - Safe same-parent output-root resolver.
   */
  constructor(locations: OutputLocationResolver) {
    this.#locations = locations;
  }

  /**
   * @description Resolves one target, stage, backup and fixed review document path.
   * @param currentDirectory - Explicit absolute host directory.
   * @param outputRoot - Requested review output root.
   * @returns Complete immutable review publication location.
   */
  resolve(
    currentDirectory: string,
    outputRoot: string,
  ): TReviewOutputLocation {
    const location = this.#locations.resolve(currentDirectory, outputRoot);
    return Object.freeze({
      ...location,
      backupRoot: resolve(
        location.parentRoot,
        `.${basename(location.targetRoot)}.aster-review-backup`,
      ),
      targetDocument: resolve(
        location.targetRoot,
        reviewDocumentSchema.fileName,
      ),
      stageDocument: resolve(
        location.stageRoot,
        reviewDocumentSchema.fileName,
      ),
    });
  }
}
