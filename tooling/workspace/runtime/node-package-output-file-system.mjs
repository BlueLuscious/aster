import { rm, stat } from "node:fs/promises";

/**
 * @description Adapts Node file inspection and recursive deletion to guarded package cleanup.
 */
export class NodePackageOutputFileSystem {
  /**
   * @description Determines whether one filesystem path is an existing file.
   * @param {string} path - Filesystem path to inspect.
   * @returns {Promise<boolean>} Whether the path is an existing file.
   */
  async isFile(path) {
    try {
      return (await stat(path)).isFile();
    } catch (error) {
      if (error?.code === "ENOENT") {
        return false;
      }

      throw error;
    }
  }

  /**
   * @description Recursively removes one policy-approved output tree when present.
   * @param {string} path - Accepted generated output root.
   * @returns {Promise<void>} Completion after the output is absent.
   */
  async removeTree(path) {
    await rm(path, { recursive: true, force: true });
  }
}
