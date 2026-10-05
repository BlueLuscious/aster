import { readFile } from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { installedAsterPackages } from "../constants/installed-aster-packages.constant.js";
import type { IInstalledPackageVersion } from "../contracts/internal/installed-package-version.contract.js";
import type { TInstalledPackageSelector } from "../types/internal/installed-package-selector.type.js";

/**
 * @description Reads public package versions resolved from the installed CLI's module context.
 */
export class InstalledPackageVersionReader {
  /**
   * @description File URL of the installed CLI entrypoint used as the package-resolution base.
   */
  readonly #base: string;

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
    selection: TInstalledPackageSelector | "all",
  ): Promise<readonly IInstalledPackageVersion[]> {
    const packages = selection === "all"
      ? installedAsterPackages
      : installedAsterPackages.filter(({ selector }) => selector === selection);

    if (packages.length === 0) {
      throw new TypeError("Unknown installed Aster package selector");
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
  async #readManifest(expectedName: string): Promise<IInstalledPackageVersion> {
    const path = findPackageJSON(expectedName, this.#base);

    if (path === undefined) {
      throw new TypeError("Installed Aster package manifest not found");
    }

    const candidate: unknown = JSON.parse(await readFile(path, "utf8"));

    if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new TypeError("Invalid installed Aster package manifest");
    }

    const manifest = candidate as Record<string, unknown>;

    if (
      !Object.hasOwn(manifest, "name")
      || manifest.name !== expectedName
      || !Object.hasOwn(manifest, "version")
      || typeof manifest.version !== "string"
      || manifest.version.length === 0
      || manifest.version.trim() !== manifest.version
    ) {
      throw new TypeError("Invalid installed Aster package manifest");
    }

    return Object.freeze({ name: expectedName, version: manifest.version });
  }
}
