import type { AsterExportPlan } from "../../export/contracts/index.js";
import { exportOutputErrorKinds } from "../constants/export-output-error-kinds.constant.js";
import type { IExportOutputFileSystem } from "../contracts/internal/export-output-file-system.contract.js";
import type { TExportOutputPublication } from "../types/internal/export-output-publication.type.js";
import { ExportOutputError } from "./export-output.error.js";
import { ExportOutputPathResolver } from "./export-output-path.resolver.js";

/**
 * @description Stages and publishes complete headless export plans under one absent output root.
 */
export class ExportOutputPublisher {
  /**
   * @description Narrow filesystem authority supplied by the standalone host.
   */
  readonly #fileSystem: IExportOutputFileSystem;

  /**
   * @description Safe host-path resolver supplied by the standalone composition.
   */
  readonly #paths: ExportOutputPathResolver;

  /**
   * @description Creates one publisher from explicit private host collaborators.
   * @param fileSystem - Narrow filesystem authority.
   * @param paths - Safe output-path resolver.
   */
  constructor(
    fileSystem: IExportOutputFileSystem,
    paths: ExportOutputPathResolver,
  ) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
  }

  /**
   * @description Publishes a complete plan through one same-parent rename or performs no mutation for an empty plan.
   * @param plan - Complete validated headless export result.
   * @param currentDirectory - Explicit host directory for relative output resolution.
   * @param outputRoot - Explicit absent output directory requested by the user.
   * @returns Immutable publication evidence.
   */
  async publish(
    plan: AsterExportPlan,
    currentDirectory: string,
    outputRoot: string,
  ): Promise<TExportOutputPublication> {
    const location = this.#paths.resolveLocation(currentDirectory, outputRoot);
    const entries = this.#paths.resolveEntries(location.stageRoot, plan.artefacts);

    if (entries.length === 0) {
      return Object.freeze({
        targetRoot: location.targetRoot,
        artefactCount: 0,
        committed: false,
      });
    }

    let ownsStage = false;

    try {
      if (await this.#fileSystem.exists(location.targetRoot)) {
        throw this.#conflict("output root already exists");
      }

      if (await this.#fileSystem.exists(location.stageRoot)) {
        throw this.#conflict("private output stage already exists");
      }

      await this.#fileSystem.ensureDirectory(location.parentRoot);
      await this.#fileSystem.createDirectory(location.stageRoot);
      ownsStage = true;

      for (const entry of entries) {
        await this.#fileSystem.ensureDirectory(entry.parent);
        await this.#fileSystem.writeText(
          entry.destination,
          entry.artefact.content,
        );
      }

      if (await this.#fileSystem.exists(location.targetRoot)) {
        throw this.#conflict("output root appeared before publication");
      }

      await this.#fileSystem.renameDirectory(
        location.stageRoot,
        location.targetRoot,
      );
      ownsStage = false;

      return Object.freeze({
        targetRoot: location.targetRoot,
        artefactCount: entries.length,
        committed: true,
      });
    } catch (error) {
      if (ownsStage) {
        try {
          await this.#fileSystem.removeDirectory(location.stageRoot);
        } catch {
          throw this.#failure();
        }
      }

      if (error instanceof ExportOutputError) {
        throw error;
      }

      throw this.#failure();
    }
  }

  /**
   * @description Creates one stable output-conflict failure.
   * @param message - Shell-owned conflict explanation.
   * @returns Sanitised output error.
   */
  #conflict(message: string): ExportOutputError {
    return new ExportOutputError(exportOutputErrorKinds.conflict, message);
  }

  /**
   * @description Creates one stable output-operation failure without native exception evidence.
   * @returns Sanitised output error.
   */
  #failure(): ExportOutputError {
    return new ExportOutputError(
      exportOutputErrorKinds.failure,
      "output publication failed",
    );
  }
}
