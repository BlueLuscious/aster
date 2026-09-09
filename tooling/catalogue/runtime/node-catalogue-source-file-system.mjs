import { readdir, readFile, stat, writeFile } from "node:fs/promises";

import { repositoryEntryKinds } from "../../shared/constants/repository-entry-kinds.constant.mjs";

/**
 * @description Adapts Node filesystem authority to catalogue source synchronisation.
 */
export class NodeCatalogueSourceFileSystem {
  /**
   * @description Determines whether one filesystem path exists.
   * @param {string} path - Filesystem path to inspect.
   * @returns {Promise<boolean>} Whether the path exists.
   */
  async exists(path) {
    try {
      await stat(path);
      return true;
    } catch (error) {
      if (error?.code === "ENOENT") {
        return false;
      }

      throw error;
    }
  }

  /**
   * @description Reads and classifies immediate directory entries.
   * @param {string} path - Directory path to inspect.
   * @returns {Promise<readonly import("../../shared/contracts/internal/repository-directory-entry.contract.mjs").IRepositoryDirectoryEntry[]>} Directory entries in host order.
   */
  async entries(path) {
    return Object.freeze(
      (await readdir(path, { withFileTypes: true })).map((entry) =>
        Object.freeze({
          name: entry.name,
          kind: entry.isDirectory()
            ? repositoryEntryKinds.directory
            : entry.isFile()
              ? repositoryEntryKinds.file
              : repositoryEntryKinds.other,
        }),
      ),
    );
  }

  /**
   * @description Reads one UTF-8 source file.
   * @param {string} path - File path to read.
   * @returns {Promise<string>} Exact UTF-8 content.
   */
  async readText(path) {
    return readFile(path, "utf8");
  }

  /**
   * @description Replaces one generated UTF-8 source file.
   * @param {string} path - Generated file path to replace.
   * @param {string} content - Complete deterministic source content.
   * @returns {Promise<void>} Completion after the generated file is replaced.
   */
  async writeText(path, content) {
    await writeFile(path, content, "utf8");
  }
}
