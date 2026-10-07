import { stat } from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { asterPublicPackages } from "../constants/aster-public-packages.constant.js";
import { asterVersionScopes } from "../../../command/constants/aster-version-scopes.constant.js";
import type { AsterInstalledPackageVersion } from "../../../command/contracts/aster-installed-package-version.contract.js";
import type { AsterVersionScopeType } from "../../../command/types/aster-version-scope.type.js";
import { PackageManifestReader } from "./package-manifest.reader.js";
import { ProjectPackageVersionError } from "./project-package-version.error.js";

/**
 * @description Reads direct Aster package versions visible from one current project.
 */
export class ProjectPackageVersionReader {
  /**
   * @description Absolute invocation directory used to select the nearest project manifest.
   */
  readonly #currentDirectory: string;

  /**
   * @description Shared JSON and installed-version validation authority.
   */
  readonly #manifests = new PackageManifestReader();

  /**
   * @description Binds project discovery to an explicit host directory, not the CLI location.
   * @param currentDirectory - Absolute invocation directory.
   */
  constructor(currentDirectory: string) {
    if (!isAbsolute(currentDirectory)) {
      throw new TypeError("Project version directory must be absolute");
    }

    this.#currentDirectory = resolve(currentDirectory);
  }

  /**
   * @description Reads one direct package or every directly declared public Aster package.
   * @param selection - Named public selector or the complete direct package set.
   * @returns Frozen installed versions in canonical public package order.
   */
  async read(selection: AsterVersionScopeType): Promise<readonly AsterInstalledPackageVersion[]> {
    const packages = selection === asterVersionScopes.all
      ? asterPublicPackages
      : asterPublicPackages.filter(({ selector }) => selector === selection);

    if (packages.length === 0) {
      throw new TypeError("Unknown public Aster package selector");
    }

    const projectManifestPath = await this.#findProjectManifest();
    let projectManifest: Readonly<Record<string, unknown>>;

    try {
      projectManifest = await this.#manifests.read(projectManifestPath);
    } catch {
      throw new ProjectPackageVersionError("Current project package.json is invalid or unavailable");
    }

    const declarations = this.#declarations(projectManifest);
    const base = pathToFileURL(projectManifestPath).href;
    const versions: AsterInstalledPackageVersion[] = [];

    for (const { name } of packages) {
      const required = declarations.get(name);

      if (required === undefined) {
        if (selection !== asterVersionScopes.all) {
          throw new ProjectPackageVersionError(`${name} is not a direct dependency of the current project`);
        }

        continue;
      }

      const version = await this.#readInstalledVersion(name, base);

      if (version === undefined) {
        if (selection === asterVersionScopes.all && !required) {
          continue;
        }

        throw new ProjectPackageVersionError(`${name} is not installed for the current project`);
      }

      versions.push(version);
    }

    return Object.freeze(versions);
  }

  /**
   * @description Selects the nearest package manifest without aggregating workspace packages.
   * @returns Absolute manifest path for the current project.
   */
  async #findProjectManifest(): Promise<string> {
    let directory = this.#currentDirectory;

    while (true) {
      const path = join(directory, "package.json");

      try {
        const metadata = await stat(path);

        if (!metadata.isFile()) {
          throw new ProjectPackageVersionError("Current project package.json is not a file");
        }

        return path;
      } catch (error) {
        if (error instanceof ProjectPackageVersionError) {
          throw error;
        }

        if (!this.#hasCode(error, "ENOENT")) {
          throw new ProjectPackageVersionError("Current project package.json is unavailable");
        }
      }

      const parent = dirname(directory);

      if (parent === directory) {
        throw new ProjectPackageVersionError("No project package.json found from the current directory");
      }

      directory = parent;
    }
  }

  /**
   * @description Classifies exact Aster declarations as required or optional.
   * @param manifest - Parsed current-project package manifest.
   * @returns Direct package names and their absence policy.
   */
  #declarations(manifest: Readonly<Record<string, unknown>>): ReadonlyMap<string, boolean> {
    const declarations = new Map<string, boolean>();

    for (const field of ["dependencies", "devDependencies", "optionalDependencies"] as const) {
      const section = manifest[field];

      if (section === undefined) {
        continue;
      }

      if (section === null || typeof section !== "object" || Array.isArray(section)) {
        throw new ProjectPackageVersionError("Invalid current project dependency declarations");
      }

      for (const { name } of asterPublicPackages) {
        const descriptor = Object.getOwnPropertyDescriptor(section, name);

        if (descriptor === undefined) {
          continue;
        }

        const range: unknown = descriptor.value;

        if (typeof range !== "string" || range.length === 0 || range.trim() !== range) {
          throw new ProjectPackageVersionError("Invalid current project Aster dependency declaration");
        }

        declarations.set(name, field !== "optionalDependencies");
      }
    }

    return declarations;
  }

  /**
   * @description Resolves a declared package from the project rather than the executable.
   * @param expectedName - Exact public package name declared by the project.
   * @param base - File URL of the selected project manifest.
   * @returns Installed version or no version when the package is absent.
   */
  async #readInstalledVersion(
    expectedName: string,
    base: string,
  ): Promise<AsterInstalledPackageVersion | undefined> {
    let path: string | undefined;

    try {
      path = findPackageJSON(expectedName, base);
    } catch (error) {
      if (this.#hasCode(error, "ERR_MODULE_NOT_FOUND")) {
        return undefined;
      }

      throw new ProjectPackageVersionError(`${expectedName} cannot be resolved from the current project`);
    }

    if (path === undefined) {
      return undefined;
    }

    try {
      return await this.#manifests.version(path, expectedName);
    } catch {
      throw new ProjectPackageVersionError(`Invalid installed manifest for ${expectedName}`);
    }
  }

  /**
   * @description Recognises one expected Node filesystem or module-resolution error code.
   * @param error - Unknown caught failure.
   * @param code - Exact native code to recognise without exposing its path-bearing message.
   * @returns Whether the caught failure has that code.
   */
  #hasCode(error: unknown, code: string): boolean {
    return error !== null && typeof error === "object" && "code" in error && error.code === code;
  }
}
