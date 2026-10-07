import { readFile } from "node:fs/promises";
import type { AsterInstalledPackageVersion } from "../../../command/contracts/aster-installed-package-version.contract.js";
import { asterPublicPackages } from "../constants/aster-public-packages.constant.js";

/**
 * @description Reads package manifests without importing their JavaScript entrypoints.
 */
export class PackageManifestReader {
  /**
   * @description Parses one JSON manifest while accepting Node-compatible UTF-8 BOM input.
   * @param path - Absolute path of the manifest to read.
   * @returns Ordinary manifest data for source-specific validation.
   */
  async read(path: string): Promise<Readonly<Record<string, unknown>>> {
    const text = await readFile(path, "utf8");
    const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    let candidate: unknown;

    try {
      candidate = JSON.parse(source);
    } catch {
      throw new TypeError("Invalid package manifest");
    }

    if (!this.#isRecord(candidate)) {
      throw new TypeError("Invalid package manifest");
    }

    return candidate;
  }

  /**
   * @description Accepts an installed package's own exact identity and version.
   * @param path - Absolute path of the installed manifest.
   * @param expectedName - Exact published package name requested by the caller.
   * @returns Frozen installed package identity and version.
   */
  async version(path: string, expectedName: string): Promise<AsterInstalledPackageVersion> {
    const manifest = await this.read(path);
    return this.#version(manifest, expectedName);
  }

  /**
   * @description Reads one installed root and its declared direct Aster runtime dependencies.
   * @param path - Absolute path of the installed root manifest.
   * @param expectedName - Exact published identity of that root.
   * @returns Canonical root record and ordered direct dependency names.
   */
  async installed(path: string, expectedName: string): Promise<Readonly<{
    /** @description Validated installed package identity and version. */
    root: AsterInstalledPackageVersion;
    /** @description Known direct Aster runtime dependency names. */
    dependencyNames: readonly string[];
  }>> {
    const manifest = await this.read(path);
    const root = this.#version(manifest, expectedName);
    const declared = manifest.dependencies;

    if (declared !== undefined && !this.#isRecord(declared)) {
      throw new TypeError("Invalid installed Aster dependency declarations");
    }

    const dependencyNames: string[] = [];

    for (const { name } of asterPublicPackages) {
      if (declared === undefined || !Object.hasOwn(declared, name)) {
        continue;
      }

      const range = declared[name];

      if (name === expectedName || typeof range !== "string" || range.length === 0 || range.trim() !== range) {
        throw new TypeError("Invalid installed Aster dependency declaration");
      }

      dependencyNames.push(name);
    }

    return Object.freeze({ root, dependencyNames: Object.freeze(dependencyNames) });
  }

  /**
   * @description Validates an installed manifest's exact identity and version.
   * @param manifest - Parsed installed package manifest.
   * @param expectedName - Exact published package name requested by the caller.
   * @returns Frozen installed package record.
   */
  #version(
    manifest: Readonly<Record<string, unknown>>,
    expectedName: string,
  ): AsterInstalledPackageVersion {
    const version = manifest.version;

    if (
      !Object.hasOwn(manifest, "name")
      || manifest.name !== expectedName
      || !Object.hasOwn(manifest, "version")
      || typeof version !== "string"
      || version.length === 0
      || version.trim() !== version
    ) {
      throw new TypeError("Invalid installed Aster package manifest");
    }

    return Object.freeze({ name: expectedName, version });
  }

  /**
   * @description Narrows parsed JSON to an ordinary record-shaped manifest.
   * @param value - Parsed JSON candidate.
   * @returns Whether the candidate is an object rather than null or an array.
   */
  #isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
}
