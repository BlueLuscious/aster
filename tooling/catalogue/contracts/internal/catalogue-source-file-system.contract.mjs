/**
 * @import { IRepositoryDirectoryEntry } from "../../../shared/contracts/internal/repository-directory-entry.contract.mjs"
 */

/**
 * @description Narrow filesystem capability required to inspect and synchronise catalogue sources.
 * @typedef {object} ICatalogueSourceFileSystem
 * @property {(path: string) => Promise<boolean>} exists - Determines whether one path exists.
 * @property {(path: string) => Promise<readonly IRepositoryDirectoryEntry[]>} entries - Reads immediate directory entries.
 * @property {(path: string) => Promise<string>} readText - Reads one UTF-8 text file.
 * @property {(path: string, content: string) => Promise<void>} writeText - Replaces one generated UTF-8 text file.
 */

export {};
