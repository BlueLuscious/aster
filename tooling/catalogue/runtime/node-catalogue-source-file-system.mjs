import { randomUUID } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

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
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
  }

  /**
   * @description Publishes one complete generated directory through staging and rollback.
   * @param {string} path - Exclusively owned generated directory path.
   * @param {readonly { relativePath: string, content: string }[]} files - Complete generated file set relative to the owned directory.
   * @returns {Promise<void>} Completion after publication and obsolete-file removal.
   */
  async replaceDirectory(path, files) {
    const token = randomUUID();
    const stagePath = `${path}.stage-${token}`;
    const backupPath = `${path}.backup-${token}`;
    let displaced = false;
    let published = false;

    await mkdir(stagePath, { recursive: true });

    try {
      for (const file of files) {
        const targetPath = resolve(stagePath, file.relativePath);

        if (!this.#contains(stagePath, targetPath)) {
          throw new TypeError(
            `Generated directory entry escapes its owned root: ${file.relativePath}`,
          );
        }

        await mkdir(dirname(targetPath), { recursive: true });
        await writeFile(targetPath, file.content, "utf8");
      }

      if (await this.exists(path)) {
        await rename(path, backupPath);
        displaced = true;
      }

      try {
        await rename(stagePath, path);
        published = true;
      } catch (error) {
        if (displaced) {
          await rename(backupPath, path);
          displaced = false;
        }

        throw error;
      }

      if (displaced) {
        await rm(backupPath, { recursive: true, force: true });
        displaced = false;
      }
    } finally {
      if (!published) {
        await rm(stagePath, { recursive: true, force: true });
      }

      if (displaced && !(await this.exists(path))) {
        await rename(backupPath, path);
      }
    }
  }

  /**
   * @description Determines whether one resolved file remains within an owned directory.
   * @param {string} root - Absolute owned directory root.
   * @param {string} target - Resolved candidate file path.
   * @returns {boolean} Whether the target remains within the root.
   */
  #contains(root, target) {
    const relation = relative(resolve(root), resolve(target));

    return !isAbsolute(relation)
      && relation !== ".."
      && !relation.startsWith(`..${sep}`);
  }
}
