import { readFile } from "node:fs/promises";
import type { AsterInstalledPackageVersion } from "../../../command/contracts/aster-installed-package-version.contract.js";

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
