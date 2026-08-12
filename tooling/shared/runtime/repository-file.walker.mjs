import { repositoryEntryKinds } from "../constants/repository-entry-kinds.constant.mjs";

/**
 * @description Walks optional repository trees with deterministic ordering and caller-owned selection.
 */
export class RepositoryFileWalker {
  /** @type {import("../contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} */
  #fileSystem;

  /** @type {import("./repository-path.resolver.mjs").RepositoryPathResolver} */
  #paths;

  /**
   * @description Creates a deterministic repository file walker.
   * @param {import("../contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Directory acquisition capability.
   * @param {import("./repository-path.resolver.mjs").RepositoryPathResolver} paths - Path composition capability.
   */
  constructor(fileSystem, paths) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
  }

  /**
   * @description Collects selected files beneath one optional root.
   * @param {string} root - Directory from which traversal starts.
   * @param {(path: string) => boolean} accepts - File-selection predicate.
   * @returns {Promise<readonly string[]>} Deterministically ordered absolute file paths.
   */
  async collect(root, accepts) {
    if (!(await this.#fileSystem.exists(root))) {
      return Object.freeze([]);
    }

    const files = [];
    const entries = [...(await this.#fileSystem.entries(root))].sort((left, right) =>
      left.name.localeCompare(right.name),
    );

    for (const entry of entries) {
      const path = this.#paths.resolve(root, entry.name);

      if (entry.kind === repositoryEntryKinds.directory) {
        files.push(...(await this.collect(path, accepts)));
      } else if (entry.kind === repositoryEntryKinds.file && accepts(path)) {
        files.push(path);
      }
    }

    return Object.freeze(files);
  }
}
