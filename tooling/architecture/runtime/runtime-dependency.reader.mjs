import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";

/**
 * @description Combines manifest fields that may provide production package imports.
 */
export class RuntimeDependencyReader {
  /**
   * @description Reads all accepted runtime dependency fields into one lookup.
   * @param {Record<string, unknown>} manifest - Package manifest to inspect.
   * @returns {Record<string, string>} Production dependency names and specifiers.
   */
  read(manifest) {
    /** @type {Record<string, string>} */
    const dependencies = {};

    for (const field of packageBoundaries.runtimeDependencyFields) {
      const value = manifest[field];

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        Object.assign(dependencies, value);
      }
    }

    return dependencies;
  }
}
