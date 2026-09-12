/**
 * @description Immutable host-neutral repository entry classifications.
 */
export const repositoryEntryKinds = Object.freeze({
  /** @description Directory entry classification. */
  directory: "directory",
  /** @description Regular file entry classification. */
  file: "file",
  /** @description Unsupported or unclassified entry classification. */
  other: "other",
});
