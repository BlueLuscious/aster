import { stat } from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { asterPublicPackages } from "../constants/aster-public-packages.constant.js";
import { asterVersionScopes } from "../../../command/constants/aster-version-scopes.constant.js";
import type { AsterInstalledPackageVersion } from "../../../command/contracts/aster-installed-package-version.contract.js";
import type { AsterPackageDependencyGroup } from "../../../command/contracts/aster-package-dependency-group.contract.js";
import { asterInstalledPackageNames } from "../../../command/constants/aster-installed-package-names.constant.js";
import type { AsterVersionScopeType } from "../../../command/types/aster-version-scope.type.js";
import { PackageManifestReader } from "./package-manifest.reader.js";
import { InstalledPackageDependencyReader } from "./installed-package-dependency.reader.js";
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

  /** @description Direct dependency resolver shared by single- and multi-root queries. */
  readonly #dependencies = new InstalledPackageDependencyReader();

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
    const selected = await this.#select(selection);
    return Object.freeze(selected.map(({ record }) => record));
  }

  /**
   * @description Reads independent direct-dependency groups for selected project packages.
   * @param selection - Named public package or the project's complete direct package set.
   * @returns Frozen groups in canonical root order.
   */
  async readDependencies(selection: AsterVersionScopeType): Promise<readonly AsterPackageDependencyGroup[]> {
    const selected = await this.#select(selection);
    const groups: AsterPackageDependencyGroup[] = [];

    for (const { record, manifestPath } of selected) {
      try {
        groups.push(await this.#dependencies.read(manifestPath, record.name));
      } catch {
        throw new ProjectPackageVersionError(`Invalid or unavailable dependencies for ${record.name}`);
      }
    }

    return Object.freeze(groups);
  }

  /**
   * @description Finds a direct project CLI for opt-in executable comparison without failing it.
   * @returns Found manifest path or an explicit unavailable-comparison outcome.
   */
  async probeDirectCli(): Promise<
    | Readonly<{ kind: "found"; manifestPath: string }>
    | Readonly<{ kind: "absent" | "no-project" | "unavailable" }>
  > {
    try {
      const projectManifestPath = await this.#findProjectManifest();

      if (projectManifestPath === undefined) {
        return Object.freeze({ kind: "no-project" });
      }

      const projectManifest = await this.#manifests.read(projectManifestPath);
      const declarations = this.#declarations(projectManifest);
      const name = asterInstalledPackageNames.cli;

      if (!declarations.has(name)) {
        return Object.freeze({ kind: "absent" });
      }

      const manifestPath = this.#resolveInstalledManifestPath(name, pathToFileURL(projectManifestPath).href);

      if (manifestPath === undefined) {
        return Object.freeze({ kind: "absent" });
      }

      await this.#manifests.version(manifestPath, name);
      return Object.freeze({ kind: "found", manifestPath });
    } catch {
      return Object.freeze({ kind: "unavailable" });
    }
  }

  /**
   * @description Selects only directly declared installed project packages with their paths.
   * @param selection - Named public selector or all directly declared packages.
   * @returns Frozen selected records and manifest paths in canonical order.
   */
  async #select(selection: AsterVersionScopeType): Promise<readonly Readonly<{
    /** @description Validated installed package record. */
    record: AsterInstalledPackageVersion;
    /** @description Installed manifest used as the dependency-resolution base. */
    manifestPath: string;
  }>[]> {
    const packages = selection === asterVersionScopes.all
      ? asterPublicPackages
      : asterPublicPackages.filter(({ selector }) => selector === selection);

    if (packages.length === 0) {
      throw new TypeError("Unknown public Aster package selector");
    }

    const projectManifestPath = await this.#findProjectManifest();

    if (projectManifestPath === undefined) {
      throw new ProjectPackageVersionError("No project package.json found from the current directory");
    }
    let projectManifest: Readonly<Record<string, unknown>>;

    try {
      projectManifest = await this.#manifests.read(projectManifestPath);
    } catch {
      throw new ProjectPackageVersionError("Current project package.json is invalid or unavailable");
    }

    const declarations = this.#declarations(projectManifest);
    const base = pathToFileURL(projectManifestPath).href;
    const selected: Readonly<{ record: AsterInstalledPackageVersion; manifestPath: string }>[] = [];

    for (const { name } of packages) {
      const required = declarations.get(name);

      if (required === undefined) {
        if (selection !== asterVersionScopes.all) {
          throw new ProjectPackageVersionError(`${name} is not a direct dependency of the current project`);
        }

        continue;
      }

      const installed = await this.#readInstalledPackage(name, base);

      if (installed === undefined) {
        if (selection === asterVersionScopes.all && !required) {
          continue;
        }

        throw new ProjectPackageVersionError(`${name} is not installed for the current project`);
      }

      selected.push(installed);
    }

    return Object.freeze(selected);
  }

  /**
   * @description Selects the nearest package manifest without aggregating workspace packages.
   * @returns Absolute current-project manifest path, or none when there is no project.
   */
  async #findProjectManifest(): Promise<string | undefined> {
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
        return undefined;
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
   * @returns Installed record and manifest path or no value when the package is absent.
   */
  async #readInstalledPackage(
    expectedName: string,
    base: string,
  ): Promise<Readonly<{ record: AsterInstalledPackageVersion; manifestPath: string }> | undefined> {
    const path = this.#resolveInstalledManifestPath(expectedName, base);

    if (path === undefined) {
      return undefined;
    }

    try {
      const record = await this.#manifests.version(path, expectedName);
      return Object.freeze({ record, manifestPath: path });
    } catch {
      throw new ProjectPackageVersionError(`Invalid installed manifest for ${expectedName}`);
    }
  }

  /**
   * @description Resolves one installed package manifest from the selected project manifest.
   * @param expectedName - Exact published package identity.
   * @param base - File URL of the selected project manifest.
   * @returns Installed manifest path or no value when the package is absent.
   */
  #resolveInstalledManifestPath(expectedName: string, base: string): string | undefined {
    try {
      return findPackageJSON(expectedName, base);
    } catch (error) {
      if (this.#hasCode(error, "ERR_MODULE_NOT_FOUND")) {
        return undefined;
      }

      throw new ProjectPackageVersionError(`${expectedName} cannot be resolved from the current project`);
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
