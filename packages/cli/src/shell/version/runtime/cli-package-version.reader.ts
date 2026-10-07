import { findPackageJSON } from "node:module";
import { asterPublicPackages } from "../constants/aster-public-packages.constant.js";
import { asterVersionScopes } from "../../../command/constants/aster-version-scopes.constant.js";
import type { AsterInstalledPackageVersion } from "../../../command/contracts/aster-installed-package-version.contract.js";
import type { AsterVersionScopeType } from "../../../command/types/aster-version-scope.type.js";
import { PackageManifestReader } from "./package-manifest.reader.js";

/**
 * @description Reads public package versions resolved from the installed CLI's module context.
 */
export class CliPackageVersionReader {
  /**
   * @description File URL of the installed CLI entrypoint used as the package-resolution base.
   */
  readonly #base: string;

  /**
   * @description Shared strict manifest reader for the selected installed package.
   */
  readonly #manifests = new PackageManifestReader();

  /**
   * @description Binds package resolution to one executable rather than the process directory.
   * @param base - File URL of the installed CLI entrypoint.
   */
  constructor(base: URL) {
    this.#base = base.href;
  }

  /**
   * @description Reads exactly the selected public packages in canonical output order.
   * @param selection - One package selector or the complete public package family.
   * @returns Frozen manifest evidence for the requested package set.
   */
  async read(
    selection: AsterVersionScopeType,
  ): Promise<readonly AsterInstalledPackageVersion[]> {
    const packages = selection === asterVersionScopes.all
      ? asterPublicPackages
      : asterPublicPackages.filter(({ selector }) => selector === selection);

    if (packages.length === 0) {
      throw new TypeError("Unknown public Aster package selector");
    }

    const versions = await Promise.all(
      packages.map(({ name }) => this.#readManifest(name)),
    );

    return Object.freeze(versions);
  }

  /**
   * @description Resolves and validates one package's own manifest without importing its code.
   * @param expectedName - Exact public identity of the requested package.
   * @returns Frozen package identity and installed version.
   */
  async #readManifest(expectedName: string): Promise<AsterInstalledPackageVersion> {
    const path = findPackageJSON(expectedName, this.#base);

    if (path === undefined) {
      throw new TypeError("Installed Aster package manifest not found");
    }

    return this.#manifests.version(path, expectedName);
  }
}
