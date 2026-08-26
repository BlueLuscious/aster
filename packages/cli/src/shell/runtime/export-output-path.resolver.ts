import { dirname, isAbsolute, relative, resolve } from "node:path";
import type { AsterExportArtefact } from "../../export/contracts/index.js";
import { exportOutputErrorKinds } from "../constants/export-output-error-kinds.constant.js";
import type { TExportOutputEntry } from "../types/internal/export-output-entry.type.js";
import type { TExportOutputLocation } from "../types/internal/export-output-location.type.js";
import { ExportOutputError } from "./export-output.error.js";

/**
 * @description Resolves user-owned output roots and validates portable logical artefact paths.
 */
export class ExportOutputPathResolver {
  /**
   * @description Cross-platform-invalid characters and control bytes forbidden in logical segments.
   */
  readonly #invalidSegmentCharacterPattern = /[<>:"\\|?*\u0000-\u001f]/u;

  /**
   * @description Windows device identities rejected to keep logical paths portable.
   */
  readonly #reservedSegmentPattern = /^(?:aux|con|nul|prn|com[1-9]|lpt[1-9])(?:\.|$)/iu;

  /**
   * @description Resolves one requested root and its deterministic private sibling stage.
   * @param currentDirectory - Explicit host directory against which relative output is resolved.
   * @param outputRoot - Explicit user-owned output directory.
   * @returns Absolute same-parent output location.
   */
  resolveLocation(
    currentDirectory: string,
    outputRoot: string,
  ): TExportOutputLocation {
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
    const targetName = targetRoot.slice(parentRoot.length).replace(/^[/\\]+/u, "");

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
   * @description Maps every validated logical artefact beneath one private staging root.
   * @param stageRoot - Absolute private staging directory.
   * @param artefacts - Complete artefacts produced by headless export planning.
   * @returns Immutable staged destination sequence preserving canonical artefact order.
   */
  resolveEntries(
    stageRoot: string,
    artefacts: readonly AsterExportArtefact[],
  ): readonly TExportOutputEntry[] {
    const destinations = new Set<string>();
    const entries = artefacts.map((artefact) => {
      const segments = this.#segments(artefact.path);
      const destination = resolve(stageRoot, ...segments);
      const relation = relative(stageRoot, destination);

      if (
        relation.length === 0
        || relation === ".."
        || relation.startsWith(`..\\`)
        || relation.startsWith("../")
        || isAbsolute(relation)
        || destinations.has(destination)
      ) {
        throw this.#conflict("export plan contains a conflicting output path");
      }

      destinations.add(destination);
      return Object.freeze({
        artefact,
        destination,
        parent: dirname(destination),
      });
    });

    return Object.freeze(entries);
  }

  /**
   * @description Splits one portable path only after validating every logical segment.
   * @param logicalPath - Forward-slash relative artefact path.
   * @returns Accepted portable path segments.
   */
  #segments(logicalPath: string): readonly string[] {
    if (
      logicalPath.length === 0
      || logicalPath.startsWith("/")
      || logicalPath.includes("\\")
    ) {
      throw this.#conflict("export plan contains an unsafe output path");
    }

    const segments = logicalPath.split("/");

    if (segments.some((segment) => !this.#validSegment(segment))) {
      throw this.#conflict("export plan contains an unsafe output path");
    }

    return segments;
  }

  /**
   * @description Determines whether one path segment is portable across supported Node hosts.
   * @param segment - One namespace or filename segment.
   * @returns Whether the segment is safe and unambiguous.
   */
  #validSegment(segment: string): boolean {
    return segment.length > 0
      && segment !== "."
      && segment !== ".."
      && !segment.endsWith(".")
      && !segment.endsWith(" ")
      && !this.#invalidSegmentCharacterPattern.test(segment)
      && !this.#reservedSegmentPattern.test(segment);
  }

  /**
   * @description Creates one stable output-conflict failure.
   * @param message - Shell-owned conflict explanation.
   * @returns Sanitised output error.
   */
  #conflict(message: string): ExportOutputError {
    return new ExportOutputError(exportOutputErrorKinds.conflict, message);
  }
}
