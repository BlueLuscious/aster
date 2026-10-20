import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";

/**
 * @description Combines manifest fields that may provide production package imports.
 */
export class RuntimeDependencyReader {
  /**
   * @description Combines own runtime dependency sections without assigning through inherited setters.
   * @remarks Later sections retain precedence, and every dependency name remains an own data property.
   * @param {Record<string, unknown>} manifest - Package manifest to inspect.
   * @returns {Record<string, unknown>} Production dependency names and specifiers.
   */
  read(manifest) {
    /** @type {[string, unknown][]} */
    const entries = [];

    for (const field of packageBoundaries.runtimeDependencyFields) {
      const value = Object.hasOwn(manifest, field) ? manifest[field] : undefined;

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        entries.push(...Object.entries(value));
      }
    }

    return Object.fromEntries(entries);
  }
}
