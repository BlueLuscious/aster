import { findPackageJSON } from "node:module";
import { pathToFileURL } from "node:url";
import type { AsterPackageDependencyGroup } from "../../../command/contracts/aster-package-dependency-group.contract.js";
import { PackageManifestReader } from "./package-manifest.reader.js";

/**
 * @description Resolves one installed root's declared direct Aster dependencies in its own tree.
 */
export class InstalledPackageDependencyReader {
  /** @description Shared installed-manifest validation authority. */
  readonly #manifests = new PackageManifestReader();

  /**
   * @description Acquires one root and its direct dependency records without loading package code.
   * @param manifestPath - Absolute path of the installed root manifest.
   * @param expectedName - Exact published root package identity.
   * @returns Frozen root group with independently resolved dependency versions.
   */
  async read(manifestPath: string, expectedName: string): Promise<AsterPackageDependencyGroup> {
    const { root, dependencyNames } = await this.#manifests.installed(manifestPath, expectedName);
    const base = pathToFileURL(manifestPath).href;
    const dependencies = [];

    for (const name of dependencyNames) {
      const path = findPackageJSON(name, base);

      if (path === undefined) {
        throw new TypeError(`Missing installed Aster dependency ${name}`);
      }

      dependencies.push(await this.#manifests.version(path, name));
    }

    return Object.freeze({ root, dependencies: Object.freeze(dependencies) });
  }
}
