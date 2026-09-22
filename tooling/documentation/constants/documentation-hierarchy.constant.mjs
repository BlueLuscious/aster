/**
 * @description Immutable canonical documentation roots, files, and required hierarchy entries.
 */
export const documentationHierarchy = Object.freeze({
  /** @description Canonical English documentation root. */
  root: "docs/en",
  /** @description Workspace package directory mirrored by package documentation. */
  packages: "packages",
  /** @description Required directory entry filename. */
  index: "index.md",
  /** @description Canonical documentation filename suffix. */
  markdownExtension: ".md",
  /** @description Root directories included in canonical documentation verification. */
  canonicalDirectories: Object.freeze([
    "collections",
    "packages",
    "project",
    "tooling",
  ]),
  /** @description Root files included in canonical documentation verification. */
  canonicalFiles: Object.freeze(["future-capabilities.md", "index.md"]),
  /** @description Required canonical documentation entry paths. */
  requiredEntries: Object.freeze([
    "index.md",
    "collections/index.md",
    "future-capabilities.md",
    "packages/index.md",
    "project/index.md",
    "tooling/index.md",
  ]),
});
