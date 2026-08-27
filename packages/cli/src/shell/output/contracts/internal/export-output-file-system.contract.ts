/**
 * @description Narrow private filesystem authority required by export publication.
 */
export interface IExportOutputFileSystem {
  /**
   * @description Determines whether one filesystem path currently exists.
   * @param path - Absolute host path to inspect.
   * @returns Whether the path exists.
   */
  exists(path: string): Promise<boolean>;

  /**
   * @description Ensures one directory and any absent ancestors exist.
   * @param path - Absolute host directory path.
   * @returns A promise completed after the directory exists.
   */
  ensureDirectory(path: string): Promise<void>;

  /**
   * @description Creates one absent directory without accepting an existing entry.
   * @param path - Absolute host directory path.
   * @returns A promise completed after exclusive creation.
   */
  createDirectory(path: string): Promise<void>;

  /**
   * @description Creates one absent UTF-8 text file without overwriting an entry.
   * @param path - Absolute host file path.
   * @param content - Complete text content to retain.
   * @returns A promise completed after the content is written.
   */
  writeText(path: string, content: string): Promise<void>;

  /**
   * @description Renames one directory within its current parent.
   * @param source - Existing absolute source directory.
   * @param destination - Absent absolute destination directory.
   * @returns A promise completed after the rename.
   */
  renameDirectory(source: string, destination: string): Promise<void>;

  /**
   * @description Removes one owned directory tree when it exists.
   * @param path - Absolute directory owned by the current publication attempt.
   * @returns A promise completed after removal.
   */
  removeDirectory(path: string): Promise<void>;
}
