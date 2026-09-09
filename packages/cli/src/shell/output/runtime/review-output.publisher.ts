import { reviewDocumentSchema } from "../../../review/constants/review-document-schema.constant.js";
import type { AsterReviewPlan } from "../../../review/contracts/index.js";
import { ReviewDocumentSerialiser } from "../../../review/runtime/review-document.serialiser.js";
import { outputErrorKinds } from "../constants/output-error-kinds.constant.js";
import type { IOutputFileSystem } from "../contracts/internal/output-file-system.contract.js";
import type { TReviewOutputPublication } from "../types/internal/review-output-publication.type.js";
import { OutputError } from "./output.error.js";
import { ReviewOutputPathResolver } from "./review-output-path.resolver.js";

/**
 * @description Stages and publishes one self-contained static review with guarded replacement.
 */
export class ReviewOutputPublisher {
  /**
   * @description Narrow filesystem authority supplied by the standalone host.
   */
  readonly #fileSystem: IOutputFileSystem;

  /**
   * @description Safe review publication-path resolver.
   */
  readonly #paths: ReviewOutputPathResolver;

  /**
   * @description Pure static review document serialiser.
   */
  readonly #documents: ReviewDocumentSerialiser;

  /**
   * @description Creates one review publisher from explicit private collaborators.
   * @param fileSystem - Narrow filesystem authority.
   * @param paths - Safe review publication-path resolver.
   * @param documents - Pure static review serialisation authority.
   */
  constructor(
    fileSystem: IOutputFileSystem,
    paths: ReviewOutputPathResolver,
    documents: ReviewDocumentSerialiser,
  ) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
    this.#documents = documents;
  }

  /**
   * @description Publishes one complete review beneath an absent or explicitly replaceable root.
   * @param plan - Complete accepted review plan.
   * @param currentDirectory - Explicit host directory for output resolution.
   * @param outputRoot - Requested review output root.
   * @param replace - Whether an existing owned review may be replaced.
   * @returns Immutable committed publication evidence.
   */
  async publish(
    plan: AsterReviewPlan,
    currentDirectory: string,
    outputRoot: string,
    replace: boolean,
  ): Promise<TReviewOutputPublication> {
    const content = this.#documents.serialise(plan);
    const location = this.#paths.resolve(currentDirectory, outputRoot);
    let existingContent: string | undefined;
    let ownsStage = false;
    let ownsBackup = false;
    let committed = false;

    try {
      const targetExists = await this.#fileSystem.exists(location.targetRoot);

      if (await this.#fileSystem.exists(location.backupRoot)) {
        throw this.#conflict("private output backup already exists");
      }

      if (targetExists) {
        if (!replace) {
          throw this.#conflict("output root already exists");
        }

        try {
          existingContent = await this.#fileSystem.readText(
            location.targetDocument,
          );
        } catch {
          throw this.#conflict(
            "existing output is not an owned Aster review",
          );
        }

        if (!this.#owned(existingContent)) {
          throw this.#conflict(
            "existing output is not an owned Aster review",
          );
        }
      }

      if (await this.#fileSystem.exists(location.stageRoot)) {
        throw this.#conflict("private output stage already exists");
      }

      await this.#fileSystem.ensureDirectory(location.parentRoot);
      await this.#fileSystem.createDirectory(location.stageRoot);
      ownsStage = true;
      await this.#fileSystem.writeText(location.stageDocument, content);

      if (targetExists) {
        let currentContent: string;

        try {
          currentContent = await this.#fileSystem.readText(
            location.targetDocument,
          );
        } catch {
          throw this.#conflict("owned review changed before replacement");
        }

        if (currentContent !== existingContent) {
          throw this.#conflict("owned review changed before replacement");
        }

        if (await this.#fileSystem.exists(location.backupRoot)) {
          throw this.#conflict("private output backup appeared before replacement");
        }

        await this.#fileSystem.renameDirectory(
          location.targetRoot,
          location.backupRoot,
        );
        ownsBackup = true;
      } else if (await this.#fileSystem.exists(location.targetRoot)) {
        throw this.#conflict("output root appeared before publication");
      }

      await this.#fileSystem.renameDirectory(
        location.stageRoot,
        location.targetRoot,
      );
      ownsStage = false;
      committed = true;

      if (ownsBackup) {
        await this.#fileSystem.removeDirectory(location.backupRoot);
        ownsBackup = false;
      }

      return Object.freeze({
        targetRoot: location.targetRoot,
        replaced: targetExists,
      });
    } catch (error) {
      if (!committed && ownsBackup) {
        try {
          await this.#fileSystem.renameDirectory(
            location.backupRoot,
            location.targetRoot,
          );
          ownsBackup = false;
        } catch {
          throw this.#failure();
        }
      }

      if (ownsStage) {
        try {
          await this.#fileSystem.removeDirectory(location.stageRoot);
        } catch {
          throw this.#failure();
        }
      }

      if (error instanceof OutputError) {
        throw error;
      }

      throw this.#failure();
    }
  }

  /**
   * @description Determines whether one document carries exact static review ownership evidence.
   * @param content - Existing target document content.
   * @returns Whether replacement may treat the target as Aster-owned.
   */
  #owned(content: string): boolean {
    return content.includes(reviewDocumentSchema.ownershipMarker);
  }

  /**
   * @description Creates one stable output-conflict failure.
   * @param message - Shell-owned conflict explanation.
   * @returns Sanitised output error.
   */
  #conflict(message: string): OutputError {
    return new OutputError(outputErrorKinds.conflict, message);
  }

  /**
   * @description Creates one stable output-operation failure without native evidence.
   * @returns Sanitised output error.
   */
  #failure(): OutputError {
    return new OutputError(
      outputErrorKinds.failure,
      "output publication failed",
    );
  }
}
