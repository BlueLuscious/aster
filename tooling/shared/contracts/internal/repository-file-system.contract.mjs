/**
 * @import { IRepositoryDirectoryEntry } from "./repository-directory-entry.contract.mjs"
 */

/**
 * @description Narrow asynchronous filesystem capability required by repository inspectors.
 * @typedef {object} IRepositoryFileSystem
 * @property {(path: string) => Promise<boolean>} exists - Determines whether one path exists.
 * @property {(path: string) => Promise<readonly IRepositoryDirectoryEntry[]>} entries - Reads immediate directory entries.
 * @property {(path: string) => Promise<string>} readText - Reads one UTF-8 text file.
 * @property {(path: string) => Promise<number>} fileSize - Reads one file size in bytes.
 */

export {};
