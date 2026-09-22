import { basename, dirname, isAbsolute, resolve } from "node:path";
import type { TOutputLocation } from "../types/internal/output-location.type.js";
import { outputErrorKinds } from "../constants/output-error-kinds.constant.js";
import { OutputError } from "./output.error.js";

/**
 * @description Resolves explicit output roots and deterministic private staging locations.
 */
export class OutputLocationResolver {
  /**
   * @description Resolves one requested root and its private staging sibling.
   * @param currentDirectory - Explicit host directory against which relative output is resolved.
   * @param outputRoot - Explicit user-owned output directory.
   * @returns Absolute same-parent output locations.
   */
  resolve(currentDirectory: string, outputRoot: string): TOutputLocation {
    if (
      currentDirectory.length === 0
      || !isAbsolute(currentDirectory)
      || outputRoot.length === 0
    ) {
      throw this.#conflict(
        "output root must be non-empty and current directory must be absolute",
      );
    }

    const targetRoot = resolve(currentDirectory, outputRoot);
    const parentRoot = dirname(targetRoot);
    const targetName = basename(targetRoot);

    if (targetName.length === 0 || targetRoot === parentRoot) {
      throw this.#conflict("output root cannot identify a filesystem root");
    }

    return Object.freeze({
      targetRoot,
      parentRoot,
      stageRoot: resolve(parentRoot, `.${targetName}.aster-stage`),
    });
  }

  /**
   * @description Creates one stable output-conflict failure.
   * @param message - Shell-owned conflict explanation.
   * @returns Sanitised output error.
   */
  #conflict(message: string): OutputError {
    return new OutputError(outputErrorKinds.conflict, message);
  }
}
