import { randomUUID } from "node:crypto";
import {
  mkdir,
  link,
  open,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

import { repositoryEntryKinds } from "../../shared/constants/repository-entry-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

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
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
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
   * @description Reads generated UTF-8 text without a separate existence check.
   * @remarks Only ENOENT denotes absence; permission, directory and other acquisition failures propagate. Required source reads remain strict.
   * @param {string} path - Generated file path to compare.
   * @returns {Promise<string | undefined>} Exact content, including an empty string, or undefined when absent.
   */
  async readTextIfPresent(path) {
    try {
      return await this.readText(path);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return undefined;
      }

      throw error;
    }
  }

  /**
   * @description Reads one source file size without acquiring its content.
   * @param {string} path - File path to inspect.
   * @returns {Promise<number>} File size in bytes.
   */
  async fileSize(path) {
    return (await stat(path)).size;
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
   * @description Publishes a manual-file edit after verifying its displaced preimage, refusing to overwrite concurrent replacement.
   * @remarks Publication requires same-filesystem hard links. Earlier generated writes are not rolled back. A reappeared destination and its displaced backup are preserved for inspection.
   * @param {string} path - Existing manual file to update.
   * @param {string} expectedContent - Exact text reviewed during planning.
   * @param {string} content - Complete next text with only owned properties changed.
   * @returns {Promise<void>} Completion after publication and private temporary-file cleanup.
   */
  async replaceText(path, expectedContent, content) {
    const token = randomUUID();
    const stagePath = `${path}.stage-${token}`;
    const probePath = `${stagePath}.probe`;
    const backupPath = `${path}.backup-${token}`;
    let staged = false;
    let probed = false;
    let displaced = false;
    let published = false;
    try {
      if (await this.readText(path) !== expectedContent) {
        throw new CatalogueSourceError("The package manifest changed before publication; retry without overwriting it.");
      }
      const stage = await open(stagePath, "wx", (await stat(path)).mode);
      staged = true;
      try {
        await stage.writeFile(content, "utf8");
      } finally {
        await stage.close();
      }
      await link(stagePath, probePath);
      probed = true;
      await rm(probePath);
      probed = false;
      await rename(path, backupPath);
      displaced = true;
      if (await this.readText(backupPath) !== expectedContent) {
        throw new CatalogueSourceError("The displaced package manifest changed; restoring it without overwriting new edits.");
      }
      await link(stagePath, path);
      published = true;
      await rm(backupPath);
      displaced = false;
    } catch (error) {
      if (displaced && !published) {
        try {
          await link(backupPath, path);
          await rm(backupPath);
        } catch (recoveryError) {
          if (recoveryError instanceof Error && "code" in recoveryError && recoveryError.code === "EEXIST") {
            throw new CatalogueSourceError(`Concurrent package manifest preserved; displaced text retained at ${backupPath}.`);
          }
          throw recoveryError;
        }
      }
      throw error;
    } finally {
      if (probed) {
        await rm(probePath, { force: true });
      }
      if (staged) {
        await rm(stagePath, { force: true });
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
