import { documentationHierarchy } from "../constants/documentation-hierarchy.constant.mjs";

/**
 * @description Acquires canonical Markdown documents in deterministic repository order.
 */
export class CanonicalDocumentReader {
  /**
   * @description Repository text acquisition capability.
   * @type {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Deterministic repository file walker.
   * @type {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker}
   */
  #files;

  /**
   * @description Repository path relation and presentation capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a canonical Markdown reader.
   * @param {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Repository text acquisition capability.
   * @param {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker} files - Deterministic repository file walker.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, files, paths) {
    this.#fileSystem = fileSystem;
    this.#files = files;
    this.#paths = paths;
  }

  /**
   * @description Reads every canonical Markdown document beneath one root.
   * @param {string} documentationRoot - Absolute canonical documentation root.
   * @returns {Promise<readonly import("../types/internal/canonical-document.type.mjs").TCanonicalDocument[]>} Ordered canonical documents.
   */
  async read(documentationRoot) {
    const paths = await this.#files.collect(documentationRoot, (path) => {
      if (!path.endsWith(documentationHierarchy.markdownExtension)) {
        return false;
      }

      const relativePath = this.#paths.display(documentationRoot, path);

      if (documentationHierarchy.canonicalFiles.includes(relativePath)) {
        return true;
      }

      return documentationHierarchy.canonicalDirectories.some((directory) =>
        relativePath.startsWith(`${directory}/`),
      );
    });
    const documents = [];

    for (const path of paths) {
      documents.push(
        Object.freeze({ path, content: await this.#fileSystem.readText(path) }),
      );
    }

    return Object.freeze(documents);
  }
}
