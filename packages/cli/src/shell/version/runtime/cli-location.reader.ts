import { realpath } from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { fileURLToPath } from "node:url";
import { asterInstalledPackageNames } from "../../../command/constants/aster-installed-package-names.constant.js";
import { asterCliLocationStatuses } from "../../../command/constants/aster-cli-location-statuses.constant.js";
import type { AsterCliLocationEvidence } from "../../../command/contracts/aster-cli-location-evidence.contract.js";
import { ProjectPackageVersionReader } from "./project-package-version.reader.js";

/**
 * @description Describes the loaded CLI module without changing command resolution.
 */
export class CliLocationReader {
  /** @description Loaded CLI entrypoint supplied by the executable composition. */
  readonly #entrypoint: URL;

  /** @description Directory from which a direct project CLI may be compared. */
  readonly #currentDirectory: string;

  /**
   * @description Binds opt-in location inspection to one executed CLI and invocation directory.
   * @param entrypoint - URL of the loaded CLI entrypoint module.
   * @param currentDirectory - Invocation directory for direct project comparison.
   */
  constructor(entrypoint: URL, currentDirectory: string) {
    this.#entrypoint = new URL(entrypoint.href);
    this.#currentDirectory = currentDirectory;
  }

  /**
   * @description Reports the loaded module and its relationship to a direct project CLI.
   * @returns Frozen location evidence even when project comparison is unavailable.
   */
  async read(): Promise<AsterCliLocationEvidence> {
    const entrypoint = fileURLToPath(this.#entrypoint);
    const project = await new ProjectPackageVersionReader(this.#currentDirectory).probeDirectCli();

    if (project.kind !== "found") {
      return Object.freeze({ entrypoint, projectCli: project.kind });
    }

    try {
      const installed = findPackageJSON(asterInstalledPackageNames.cli, this.#entrypoint.href);

      if (installed === undefined) {
        return Object.freeze({ entrypoint, projectCli: asterCliLocationStatuses.unavailable });
      }

      const [executedPath, projectPath] = await Promise.all([
        realpath(installed),
        realpath(project.manifestPath),
      ]);

      return Object.freeze({
        entrypoint,
        projectCli: executedPath === projectPath
          ? asterCliLocationStatuses.same
          : asterCliLocationStatuses.different,
      });
    } catch {
      return Object.freeze({ entrypoint, projectCli: asterCliLocationStatuses.unavailable });
    }
  }
}
