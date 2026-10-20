/**
 * @description Reads strict JSON objects through an injected repository filesystem capability.
 */
export class RepositoryJsonReader {
  /**
   * @description Repository filesystem used to read JSON source text.
   * @type {import("../contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Creates a strict repository JSON reader.
   * @param {import("../contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Text acquisition capability.
   */
  constructor(fileSystem) {
    this.#fileSystem = fileSystem;
  }

  /**
   * @description Parses strict JSON and removes object prototypes before exposing repository data.
   * @remarks All parsed objects, including nested records, retain only JSON-owned fields; arrays retain their ordinary prototype. This does not freeze or validate domain-specific values.
   * @param {string} path - JSON file path.
   * @returns {Promise<Record<string, unknown>>} Parsed JSON object.
   */
  async read(path) {
    const value = JSON.parse(await this.#fileSystem.readText(path), (_key, candidate) => {
      if (typeof candidate === "object" && candidate !== null && !Array.isArray(candidate)) {
        Object.setPrototypeOf(candidate, null);
      }
      return candidate;
    });

    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new TypeError(`Repository JSON must contain an object: ${path}`);
    }

    return value;
  }
}
