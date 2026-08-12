/**
 * @description Narrow destructive filesystem capability owned by package output cleanup.
 * @typedef {object} IPackageOutputFileSystem
 * @property {(path: string) => Promise<boolean>} isFile - Determines whether one path is a file.
 * @property {(path: string) => Promise<void>} removeTree - Removes one previously accepted tree idempotently.
 */

export {};
