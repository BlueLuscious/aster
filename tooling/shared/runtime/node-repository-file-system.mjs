import { readdir, readFile, stat } from "node:fs/promises";

import { repositoryEntryKinds } from "../constants/repository-entry-kinds.constant.mjs";

/**
 * @description Adapts Node filesystem authority to the narrow repository inspection contract.
 */
export class NodeRepositoryFileSystem {
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
   * @returns {Promise<readonly import("../contracts/internal/repository-directory-entry.contract.mjs").IRepositoryDirectoryEntry[]>} Directory entries in host order.
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
   * @description Reads one UTF-8 repository text file.
   * @param {string} path - File path to read.
   * @returns {Promise<string>} Exact UTF-8 file content.
   */
  async readText(path) {
    return readFile(path, "utf8");
  }

  /**
   * @description Reads one file size without acquiring its content.
   * @param {string} path - File path to inspect.
   * @returns {Promise<number>} File size in bytes.
   */
  async fileSize(path) {
    return (await stat(path)).size;
  }
}
