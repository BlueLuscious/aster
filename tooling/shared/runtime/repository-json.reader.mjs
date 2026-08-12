/**
 * @description Reads strict JSON objects through an injected repository filesystem capability.
 */
export class RepositoryJsonReader {
  /** @type {import("../contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} */
  #fileSystem;

  /**
   * @description Creates a strict repository JSON reader.
   * @param {import("../contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Text acquisition capability.
   */
  constructor(fileSystem) {
    this.#fileSystem = fileSystem;
  }

  /**
   * @description Reads and parses one JSON object without accepting non-standard syntax.
   * @param {string} path - JSON file path.
   * @returns {Promise<Record<string, unknown>>} Parsed JSON object.
   */
  async read(path) {
    const value = JSON.parse(await this.#fileSystem.readText(path));

    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new TypeError(`Repository JSON must contain an object: ${path}`);
    }

    return value;
  }
}
