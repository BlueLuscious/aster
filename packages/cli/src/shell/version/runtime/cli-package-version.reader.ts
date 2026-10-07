import { findPackageJSON } from "node:module";
import { asterInstalledPackageNames } from "../../../command/constants/aster-installed-package-names.constant.js";
import type { AsterPackageDependencyGroup } from "../../../command/contracts/aster-package-dependency-group.contract.js";
import { CliPackageVersionError } from "./cli-package-version.error.js";
import { InstalledPackageDependencyReader } from "./installed-package-dependency.reader.js";

/**
 * @description Reads direct Aster dependencies from the executed CLI's installed manifest.
 */
export class CliPackageVersionReader {
  /**
   * @description File URL of the installed CLI entrypoint used as the package-resolution base.
   */
  readonly #base: string;

  /**
   * @description Shared strict direct-dependency acquisition authority.
   */
  readonly #dependencies = new InstalledPackageDependencyReader();

  /**
   * @description Binds package resolution to one executable rather than the process directory.
   * @param base - File URL of the installed CLI entrypoint.
   */
  constructor(base: URL) {
    this.#base = base.href;
  }

  /**
   * @description Reads the executed CLI as root with only its declared Aster dependencies.
   * @returns Frozen dependency group resolved relative to the installed CLI.
   */
  async readDependencies(): Promise<AsterPackageDependencyGroup> {
    const name = asterInstalledPackageNames.cli;
    let path: string | undefined;

    try {
      path = findPackageJSON(name, this.#base);
    } catch {
      throw new CliPackageVersionError(`${name} is unavailable for the executed CLI`);
    }

    if (path === undefined) {
      throw new CliPackageVersionError(`${name} is unavailable for the executed CLI`);
    }

    try {
      return await this.#dependencies.read(path, name);
    } catch {
      throw new CliPackageVersionError(`Invalid or unavailable dependencies for ${name}`);
    }
  }
}
