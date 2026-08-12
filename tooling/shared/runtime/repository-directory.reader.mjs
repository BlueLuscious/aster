import { repositoryEntryKinds } from "../constants/repository-entry-kinds.constant.mjs";

/**
 * @description Reads deterministic immediate directory membership from optional roots.
 */
export class RepositoryDirectoryReader {
  /** @type {import("../contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} */
  #fileSystem;

  /**
   * @description Creates an optional-root directory reader.
   * @param {import("../contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Directory acquisition capability.
   */
  constructor(fileSystem) {
    this.#fileSystem = fileSystem;
  }

  /**
   * @description Reads sorted immediate child directory names.
   * @param {string} root - Optional directory root.
   * @returns {Promise<readonly string[]>} Sorted directory names, or an empty list when absent.
   */
  async read(root) {
    if (!(await this.#fileSystem.exists(root))) {
      return Object.freeze([]);
    }

    return Object.freeze(
      (await this.#fileSystem.entries(root))
        .filter((entry) => entry.kind === repositoryEntryKinds.directory)
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right)),
    );
  }
}
