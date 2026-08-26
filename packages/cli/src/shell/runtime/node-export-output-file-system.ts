import {
  access,
  mkdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import type { IExportOutputFileSystem } from "../contracts/internal/export-output-file-system.contract.js";

/**
 * @description Node filesystem adapter for private standalone export publication.
 */
export class NodeExportOutputFileSystem implements IExportOutputFileSystem {
  /**
   * @description Determines whether one path exists without hiding non-absence failures.
   * @param path - Absolute host path to inspect.
   * @returns Whether the path exists.
   */
  async exists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch (error) {
      if (this.#code(error) === "ENOENT") {
        return false;
      }

      throw error;
    }
  }

  /**
   * @description Ensures one directory and any absent ancestors exist.
   * @param path - Absolute host directory path.
   * @returns A promise completed after the directory exists.
   */
  async ensureDirectory(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }

  /**
   * @description Creates one absent directory exclusively.
   * @param path - Absolute host directory path.
   * @returns A promise completed after exclusive creation.
   */
  async createDirectory(path: string): Promise<void> {
    await mkdir(path);
  }

  /**
   * @description Creates one absent UTF-8 file without overwriting an existing entry.
   * @param path - Absolute host file path.
   * @param content - Complete text content to retain.
   * @returns A promise completed after the content is written.
   */
  async writeText(path: string, content: string): Promise<void> {
    await writeFile(path, content, { encoding: "utf8", flag: "wx" });
  }

  /**
   * @description Publishes one complete staged directory through a native rename.
   * @param source - Existing absolute staging root.
   * @param destination - Absent absolute output root.
   * @returns A promise completed after publication.
   */
  async renameDirectory(source: string, destination: string): Promise<void> {
    await rename(source, destination);
  }

  /**
   * @description Removes one current-run staging tree without affecting sibling entries.
   * @param path - Absolute staging root owned by the current publication attempt.
   * @returns A promise completed after removal.
   */
  async removeDirectory(path: string): Promise<void> {
    await rm(path, { recursive: true, force: true });
  }

  /**
   * @description Reads a native error code without widening unknown exceptions.
   * @param error - Unknown filesystem rejection.
   * @returns Native string code when present.
   */
  #code(error: unknown): string | undefined {
    if (
      typeof error !== "object"
      || error === null
      || !("code" in error)
    ) {
      return undefined;
    }

    return typeof error.code === "string" ? error.code : undefined;
  }
}
